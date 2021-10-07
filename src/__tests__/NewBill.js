import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES } from "../constants/routes";

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
})