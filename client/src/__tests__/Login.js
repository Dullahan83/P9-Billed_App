/**
 * @jest-environment jsdom
 */

import LoginUI from "../views/LoginUI";
import Login from "../containers/Login.js";
import { ROUTES } from "../constants/routes";
import { fireEvent, screen } from "@testing-library/dom";
import mockStore from "../__mocks__/store"


jest.mock("../app/store", () => mockStore)


describe("Given that I am a user on login page", () => {
   describe("When I do not fill fields and I click on employee button Login In", () => {
      test("Then It should renders Login page", () => {
         document.body.innerHTML = LoginUI();

         const inputEmailUser = screen.getByTestId("employee-email-input");
         expect(inputEmailUser.value).toBe("");

         const inputPasswordUser = screen.getByTestId(
            "employee-password-input"
         );
         expect(inputPasswordUser.value).toBe("");

         const form = screen.getByTestId("form-employee");
         const handleSubmit = jest.fn((e) => e.preventDefault());

         form.addEventListener("submit", handleSubmit);
         fireEvent.submit(form);
         expect(screen.getByTestId("form-employee")).toBeTruthy();
      });
   });

   describe("When I do fill fields in incorrect format and I click on employee button Login In", () => {
      test("Then It should renders Login page", () => {
         document.body.innerHTML = LoginUI();

         const inputEmailUser = screen.getByTestId("employee-email-input");
         fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
         expect(inputEmailUser.value).toBe("pasunemail");

         const inputPasswordUser = screen.getByTestId(
            "employee-password-input"
         );
         fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
         expect(inputPasswordUser.value).toBe("azerty");

         const form = screen.getByTestId("form-employee");
         const handleSubmit = jest.fn((e) => e.preventDefault());

         form.addEventListener("submit", handleSubmit);
         fireEvent.submit(form);
         expect(screen.getByTestId("form-employee")).toBeTruthy();
      });
   });

   describe("When I do fill fields in correct format and I click on employee button Login In", () => {
      test("Then I should be identified as an Employee in app", () => {
         document.body.innerHTML = LoginUI();
         const inputData = {
            email: "johndoe@email.com",
            password: "azerty",
         };

         const inputEmailUser = screen.getByTestId("employee-email-input");
         fireEvent.change(inputEmailUser, {
            target: { value: inputData.email },
         });
         expect(inputEmailUser.value).toBe(inputData.email);

         const inputPasswordUser = screen.getByTestId(
            "employee-password-input"
         );
         fireEvent.change(inputPasswordUser, {
            target: { value: inputData.password },
         });
         expect(inputPasswordUser.value).toBe(inputData.password);

         const form = screen.getByTestId("form-employee");

         // localStorage should be populated with form data
         Object.defineProperty(window, "localStorage", {
            value: {
               getItem: jest.fn(() => null),
               setItem: jest.fn(() => null),
            },
            writable: true,
         });

         // we have to mock navigation to test it
         const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
         };

         let PREVIOUS_LOCATION = "";

         const store = jest.fn();

         const login = new Login({
            document,
            localStorage: window.localStorage,
            onNavigate,
            PREVIOUS_LOCATION,
            store,
         });

         const handleSubmit = jest.fn(login.handleSubmitEmployee);
         login.login = jest.fn().mockResolvedValue({});
         form.addEventListener("submit", handleSubmit);
         fireEvent.submit(form);
         expect(handleSubmit).toHaveBeenCalled();
         expect(window.localStorage.setItem).toHaveBeenCalled();
         expect(window.localStorage.setItem).toHaveBeenCalledWith(
            "user",
            JSON.stringify({
               type: "Employee",
               email: inputData.email,
               password: inputData.password,
               status: "connected",
            })
         );
      });

      test("It should renders Bills page", () => {
         expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
      });
   });
});

describe("Given that I am a user on login page", () => {
   describe("When I do not fill fields and I click on admin button Login In", () => {
      test("Then It should renders Login page", () => {
         document.body.innerHTML = LoginUI();

         const inputEmailUser = screen.getByTestId("admin-email-input");
         expect(inputEmailUser.value).toBe("");

         const inputPasswordUser = screen.getByTestId("admin-password-input");
         expect(inputPasswordUser.value).toBe("");

         const form = screen.getByTestId("form-admin");
         const handleSubmit = jest.fn((e) => e.preventDefault());

         form.addEventListener("submit", handleSubmit);
         fireEvent.submit(form);
         expect(screen.getByTestId("form-admin")).toBeTruthy();
      });
   });

   describe("When I do fill fields in incorrect format and I click on admin button Login In", () => {
      test("Then it should renders Login page", () => {
         document.body.innerHTML = LoginUI();

         const inputEmailUser = screen.getByTestId("admin-email-input");
         fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
         expect(inputEmailUser.value).toBe("pasunemail");

         const inputPasswordUser = screen.getByTestId("admin-password-input");
         fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
         expect(inputPasswordUser.value).toBe("azerty");

         const form = screen.getByTestId("form-admin");
         const handleSubmit = jest.fn((e) => e.preventDefault());

         form.addEventListener("submit", handleSubmit);
         fireEvent.submit(form);
         expect(screen.getByTestId("form-admin")).toBeTruthy();
      });
   });

   describe("When I do fill fields in correct format and I click on admin button Login In", () => {
      test("Then I should be identified as an HR admin in app", () => {
         document.body.innerHTML = LoginUI();
         const inputData = {
            type: "Admin",
            email: "johndoe@email.com",
            password: "azerty",
            status: "connected",
         };

         const inputEmailUser = screen.getByTestId("admin-email-input");
         fireEvent.change(inputEmailUser, {
            target: { value: inputData.email },
         });
         expect(inputEmailUser.value).toBe(inputData.email);

         const inputPasswordUser = screen.getByTestId("admin-password-input");
         fireEvent.change(inputPasswordUser, {
            target: { value: inputData.password },
         });
         expect(inputPasswordUser.value).toBe(inputData.password);

         const form = screen.getByTestId("form-admin");

         // localStorage should be populated with form data
         Object.defineProperty(window, "localStorage", {
            value: {
               getItem: jest.fn(() => null),
               setItem: jest.fn(() => null),
            },
            writable: true,
         });

         // we have to mock navigation to test it
         const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
         };

         let PREVIOUS_LOCATION = "";

         const store = jest.fn();

         const login = new Login({
            document,
            localStorage: window.localStorage,
            onNavigate,
            PREVIOUS_LOCATION,
            store,
         });

         const handleSubmit = jest.fn(login.handleSubmitAdmin);
         login.login = jest.fn().mockResolvedValue({});
         form.addEventListener("submit", handleSubmit);
         fireEvent.submit(form);
         expect(handleSubmit).toHaveBeenCalled();
         expect(window.localStorage.setItem).toHaveBeenCalled();
         expect(window.localStorage.setItem).toHaveBeenCalledWith(
            "user",
            JSON.stringify({
               type: "Admin",
               email: inputData.email,
               password: inputData.password,
               status: "connected",
            })
         );
      });

      test("It should renders HR dashboard page", () => {
         expect(screen.queryByText("Validations")).toBeTruthy();
      });
   });
});
// tests added
describe("Given that i am a user on the login page", () => {

   describe("When i submit an employee form filled correctly and i do not already have an account ", () => {
      test("An account should be created on submit", () => {
         //insert test
         document.body.innerHTML = LoginUI();

         const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
         };

         let PREVIOUS_LOCATION = "";
         const store = jest.fn()
         const login = new Login({
            document,
            onNavigate,
            store,
            localStorage: window.localStorage,
         });

         const inputData = {
            type: "Employee",
            email: "employee2@test.tld",
            password: "azerty"
         }

         //simulate our dbUser
         const userData = [{
            type: "Employee",
            email: "employee@test.tld",
            password: "employee"
         }, {
            type: "Employee",
            email: "test@test.tld",
            password: "employee"
         }, { type: "Admin", email: "admin@test.tld", password: "admin" }]

         const inputEmailUser = screen.getByTestId("employee-email-input");
         fireEvent.change(inputEmailUser, {
            target: { value: inputData.email },
         });

         const inputPasswordUser = screen.getByTestId("employee-password-input");
         fireEvent.change(inputPasswordUser, {
            target: { value: inputData.password },
         });
         expect(inputPasswordUser.value).not.toBeNull

         const handleSubmit = jest.fn(login.handleSubmitEmployee);
         login.login = jest.fn().mockResolvedValue({});
         const form = screen.getByTestId("form-employee");
         form.addEventListener("submit", handleSubmit)
         fireEvent.submit(form)
         expect(handleSubmit).toHaveBeenCalled()


         userData.forEach(user => {
            if (inputData.type.toLowerCase() === user.type.toLowerCase()) {
               expect(inputEmailUser.value).not.toBe(user.email)
               expect(window.localStorage.setItem).toHaveBeenCalled();
               expect(window.localStorage.setItem).toHaveBeenCalledWith(
                  "user",
                  JSON.stringify({
                     type: "Employee",
                     email: inputData.email,
                     password: inputData.password,
                     status: "connected",
                  })
               );
            }
         })


      });
   });

   // describe("When i submit an admin form filled correctly and i do not already have an account ", () => {
   //    test("An account should be created on submit", () => {
   //       //insert test
   //    });
   // });
});
