import { screen, fireEvent } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js"
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import firestore from "../app/Firestore.js";
import Router from "../app/Router";

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
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      document.body.innerHTML = `<div id="root"></div>`;
      firestore.bills = () => ({
        bills,
        get: jest.fn().mockResolvedValue(),
      });

      Object.defineProperty(window, "location", {
        value: { hash: ROUTES_PATH["Bills"] },
      });
      Router();
      
      expect(screen.getByTestId("icon-window")).toBeTruthy;
      expect(screen.getByTestId("icon-window").classList.contains("active-icon")).toBeTruthy();
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML =  BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)

      expect(dates).toEqual(datesSorted)
    })
  })
  describe("When I am on Bills page but it is loading", () => {
    test("Then, Loading page should be displayed", () => {
      document.body.innerHTML = BillsUI({ loading: true });
      expect(screen.getByText("Loading...")).toBeTruthy();
    });
  });
  describe("When I am on Bills page but their is error", () => {
    test("Then, Error page should be displayed", () => {
      document.body.innerHTML = BillsUI({ error: true });
      expect(screen.getByText("Erreur")).toBeTruthy();
    });
  });
  describe("When I am on Bills Page and there is bill and i click icon eye", () => {
    test("Then function handleClickIconEye should be called", () => {
      document.body.innerHTML =  BillsUI({ data: [bills] });

      const bill = new Bills({
        document,
        onNavigate,
        firestore: null,
        bills,
        localStorage: window.localStorage,
      });

      $.fn.modal = jest.fn();

      const iconEye = screen.getAllByTestId("icon-eye")[0];
      const modale = document.getElementById('modaleFile');
      const handleClickIconEye = jest.fn(() => { bill.handleClickIconEye(iconEye) });

      iconEye.addEventListener("click", handleClickIconEye);
      fireEvent.click(iconEye);

      expect(modale).toBeTruthy();
      expect(handleClickIconEye).toBeCalled();
    });
  });
  describe("When I am on Bills page and I click on New Bill button", () => {
    test("Then function handleClickNewBill should called and new bill page should be displayed", () => {
      document.body.innerHTML = BillsUI({ data: [] });
      const bill = new Bills({
        document,
        onNavigate,
        firestore: null,
        bills,
        localStorage: window.localStorage,
      });

      const handleClickNewBill = jest.fn((e) => bill.handleClickNewBill(e));
      const btn = screen.getByTestId("btn-new-bill");

      btn.addEventListener("click", handleClickNewBill);
      fireEvent.click(btn);

      expect(handleClickNewBill).toHaveBeenCalled();
      expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy();
    });
  });
})