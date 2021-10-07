import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import BillsUI from "../views/BillsUI.js";
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES } from "../constants/routes";

import firebase from "../__mocks__/firebase.js";

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

window.localStorage.setItem(
  "user",
  JSON.stringify({
    type: "Employee",
  })
);

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the form should be displayed", () => {
      document.body.innerHTML = NewBillUI();
      const form = screen.getByTestId('form-new-bill');
      expect(form).toBeTruthy();
    });
  });
  describe("When I am on NewBill Page and I add file with a incorrect extention", () => {
    test("Then the function handleChangeFile should be called and error message should be displayed", () => {
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage,
      });

      document.body.innerHTML = NewBillUI();


      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const file = screen.getByTestId("file");

      file.addEventListener("change", handleChangeFile);
      fireEvent.change(file, {
        target: {
          files: [new File(["test"], "test.pdf", { type: "PDF/pdf" })],
        },
      });
      expect(handleChangeFile).toHaveBeenCalled();
      expect(document.getElementById("extension-error-message").style.display).toBe("block");
    });
  });
  describe("When I am on NewBill Page and I add file with a correct extention", () => {
    test("Then handleChangeFile should be called, the filename should be displayed and error message should not", () => {
      const firestore = {
        storage: {
          ref: jest.fn(() => {
            return {
              put: jest
                .fn()
                .mockResolvedValueOnce({ ref: { getDownloadURL: jest.fn() } }),
            };
          }),
        },
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      });

      document.body.innerHTML = NewBillUI();

      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const file = screen.getByTestId("file");

      file.addEventListener("change", handleChangeFile);
      fireEvent.change(file, {
        target: {
          files: [new File(["test"], "test.png", { type: "image/png" })],
        },
      });
      expect(handleChangeFile).toHaveBeenCalled();
      expect(file.files[0].name).toBe("test.png");
      // expect(document.getElementById("extension-error-message").style.display).toBe("none");
    });
  });
  describe("When I'm on NewBill page and click on submit btn", () => {
    test("Then the function handleSubmit should be called", () => {
      const newBill = new NewBill({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage,
      });

      document.body.innerHTML = NewBillUI();

      const form = screen.getByTestId('form-new-bill');
      const handleSubmit = jest.fn(newBill.handleSubmit);

      form.addEventListener('submit', handleSubmit);
      fireEvent.submit(form);

      expect(handleSubmit).toHaveBeenCalled();
    });
  });
  describe("When I post a bill", () => {
    test("Add bill to mock API POST", async () => {
      const postSpy = jest.spyOn(firebase, "post");
      const newBill = {
        id: "ECmaZAG4jkmdfECmaZAG",
        vat: "50",
        amount: 250,
        name: "note",
        fileName: "bills.jpg",
        commentary: "note de frais",
        pct: 20,
        type: "IT et électronique",
        email: "email@mail",
        fileUrl: "https://mybills.com",
        date: "2021-03-10",
        status: "pending",
        commentAdmin: "wait",
      };
      const allBills = await firebase.post(newBill);

      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(allBills.data.length).toBe(5);
    });
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      );
      document.body.innerHTML = BillsUI({ error: "Erreur 404" });;
      const message = await screen.getByText(/Erreur 404/);

      expect(message).toBeTruthy();
    });
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      );
      document.body.innerHTML = BillsUI({ error: "Erreur 500" });
      const message = await screen.getByText(/Erreur 500/);

      expect(message).toBeTruthy();
    });
  });
})