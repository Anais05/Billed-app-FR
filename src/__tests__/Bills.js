import { screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      document.body.innerHTML = BillsUI({ data: [] })
      //to-do write expect expression
    })
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
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
})