/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from '../__mocks__/store.js'
import Bills from "../containers/Bills.js";

import router from "../app/Router.js";
jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
   describe("When I am on Bills Page", () => {
      test("Then bill icon in vertical layout should be highlighted", async () => {
         Object.defineProperty(window, "localStorage", {
            value: localStorageMock,
         });
         window.localStorage.setItem(
            "user",
            JSON.stringify({
               type: "Employee",
            })
         );
         const root = document.createElement("div");
         root.setAttribute("id", "root");
         document.body.append(root);
         router();
         window.onNavigate(ROUTES_PATH.Bills);
         await waitFor(() => screen.getByTestId("icon-window"));
         const windowIcon = screen.getByTestId("icon-window");
         //to-do write expect expression
         expect(windowIcon.classList).toContain("active-icon");
      });
      test("Then bills should be ordered from earliest to latest", () => {
         document.body.innerHTML = BillsUI({ data: bills });
         const dates = screen
            .getAllByText(
               /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
            )
            .map((a) => a.innerHTML);
         //Bug report 1 - Test part: fixing sort test function
         const antiChrono = (a, b) => { a < b ? 1 : -1 };
         const datesSorted = [...dates].sort(antiChrono);
         expect(dates).toEqual(datesSorted);
      });

      // Tests added 
      test("Then clicking on eye icon should open a modal", () => {

         document.body.innerHTML = BillsUI({ data: bills });
         const store = jest.fn()
         const bill = new Bills({
            document,
            onNavigate,
            store,
            localStorage: window.localStorage,
         });
         const icons = screen.getAllByTestId("icon-eye");

         // emulate the modal
         $.fn.modal = jest.fn();

         //Check if for each icon, the function associated is called and if modal is showing 
         icons.forEach((icon) => {
            const handleClickIconEye = jest.fn(() =>
               bill.handleClickIconEye(icon)
            );
            icon.addEventListener("click", handleClickIconEye);
            fireEvent.click(icon);
            expect(handleClickIconEye).toHaveBeenCalled();
            expect($.fn.modal).toHaveBeenCalledWith("show")

         });
      });

      describe("When i click on new bill button", () => {
         test("Then i should be redirected to new bill page", () => {
            document.body.innerHTML = BillsUI({ data: bills });

            const onNavigate = (pathname) => {
               document.body.innerHTML = ROUTES({ pathname });
            };

            let PREVIOUS_LOCATION = "";
            const store = jest.fn()
            const bill = new Bills({
               document,
               onNavigate,
               store,
               localStorage: window.localStorage,
            });

            const newBill = screen.getByTestId("btn-new-bill")

            const handleClickNewBill = jest.fn(() => bill.handleClickNewBill)

            newBill.addEventListener("click", handleClickNewBill)
            fireEvent.click(newBill)

            expect(handleClickNewBill).toHaveBeenCalled()
            expect(screen.getAllByTestId("form-new-bill")).toBeTruthy()

         })
      })
   });
});

// test d'intégration GET
describe("Given I am a user connected as an Employee", () => {
   describe("When I navigate to bills", () => {
      test("fetches bills from mock API GET", async () => {
         localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
         const root = document.createElement("div")
         root.setAttribute("id", "root")
         document.body.append(root)
         router()
         window.onNavigate(ROUTES_PATH.Bills)
         await waitFor(() => screen.getByText("Mes notes de frais"))
         const tbody = screen.getByTestId("tbody")
         expect(tbody).toBeTruthy()
      })

      describe("When an error occurs on API", () => {
         beforeEach(() => {
            jest.spyOn(mockStore, "bills")
            Object.defineProperty(
               window,
               'localStorage',
               { value: localStorageMock }
            )
            window.localStorage.setItem('user', JSON.stringify({
               type: 'Employee',
               email: "a@a"
            }))
            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.appendChild(root)
            router()
         })
         test("fetches bills from an API and fails with 404 message error", async () => {

            mockStore.bills.mockImplementationOnce(() => {
               return {
                  list: () => {
                     return Promise.reject(new Error("Erreur 404"))
                  }
               }
            })
            window.onNavigate(ROUTES_PATH.Bills)
            await new Promise(process.nextTick);
            const message = await screen.getByText(/Erreur 404/)
            expect(message).toBeTruthy()
         })

         test("fetches messages from an API and fails with 500 message error", async () => {

            mockStore.bills.mockImplementationOnce(() => {
               return {
                  list: () => {
                     return Promise.reject(new Error("Erreur 500"))
                  }
               }
            })

            window.onNavigate(ROUTES_PATH.Bills)
            await new Promise(process.nextTick);
            const message = await screen.getByText(/Erreur 500/)
            expect(message).toBeTruthy()
         })
      })

   })
})