/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom";
import '@testing-library/jest-dom'
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from '../__mocks__/store.js'
import { ROUTES } from "../constants/routes";
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import router from "../app/Router.js";
import BillsUI from "../views/BillsUI.js";

jest.mock("../app/store", () => mockStore)



describe("Given I am connected as an employee and i am on newbill page", () => {
  beforeEach(() => {
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

  describe("When i choose an incorrect format file", () => {
    test("Then a message should appear to inform us on the correct format", () => {
      document.body.innerHTML = NewBillUI()

      const extensionArray = ["jpeg", "jpg", "png"]
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = "";
      const store = jest.fn()

      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      })
      const file = new File(["test"], "test.bmp", { type: "image/bmp" })
      const inputFile = screen.getByTestId("file")

      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))

      inputFile.addEventListener("change", handleChangeFile)
      fireEvent.change(inputFile, { target: { files: [file] } })
      expect(handleChangeFile).toHaveBeenCalled()

      const fileName = inputFile.files[0].name
      const extension = fileName.split(".")[1]
      expect(extensionArray.includes(extension)).toBeFalsy()
      const message = screen.getByTestId("error-message")
      expect(message).toBeTruthy()
    })
  })

  describe("When i choose a file in correct format", () => {
    test("Then the file name should appear", async () => {
      document.body.innerHTML = NewBillUI()

      const extensionArray = ["jpeg", "jpg", "png"]
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = "";
      const store = jest.fn()

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      })
      //jpg
      const fileJpg = new File(["test"], "test.jpg", { type: "image/jpg" })
      const inputFile = screen.getByTestId("file")

      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))

      inputFile.addEventListener("change", handleChangeFile)
      fireEvent.change(inputFile, { target: { files: [fileJpg] } })
      expect(handleChangeFile).toHaveBeenCalled()

      const fileNameJpg = inputFile.files[0].name
      const extensionJpg = fileNameJpg.split(".")[1]
      expect(extensionArray.includes(extensionJpg)).toBeTruthy()

      // jpeg
      const fileJpeg = new File(["test"], "test.jpeg", { type: "image/jpeg" })
      fireEvent.change(inputFile, { target: { files: [fileJpeg] } })
      expect(handleChangeFile).toHaveBeenCalled()

      const fileNameJpeg = inputFile.files[0].name
      const extensionJpeg = fileNameJpeg.split(".")[1]
      expect(extensionArray.includes(extensionJpeg)).toBeTruthy()

      //png
      const filePng = new File(["test"], "test.png", { type: "image/png" })
      fireEvent.change(inputFile, { target: { files: [filePng] } })
      expect(handleChangeFile).toHaveBeenCalled()

      const fileNamePng = inputFile.files[0].name
      const extensionPng = fileNamePng.split(".")[1]
      expect(extensionArray.includes(extensionPng)).toBeTruthy()
    })
  })

  describe("When I fill all the fields correctly and press submit button", () => {
    test("Then the new bill should be created", () => {
      document.body.innerHTML = NewBillUI()

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const newBill = new NewBill({
        document,
        onNavigate,
        mockStore,
        localStorage: window.localStorage,
      })

      const form = screen.getByTestId("form-new-bill")
      const handleSubmit = jest.fn((e) => { newBill.handleSubmit(e) })
      form.addEventListener("submit", handleSubmit)
      fireEvent.submit(form)
      expect(form).toBeTruthy()
      expect(handleSubmit).toHaveBeenCalled()
    })
  })
})

// test d'intégration Post
describe("Given I am a user connected as an Employee", () => {
  describe("When I create a new Bill", () => {
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
      test("post new bill to an API and fails with 404 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            create: () => {
              return Promise.reject(new Error("Erreur 404"))
            }
          }
        })
        document.body.innerHTML = BillsUI({ error: "Erreur 404" })
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })

      test("post new bill to an API and fails with 500 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            create: () => {
              return Promise.reject(new Error("Erreur 500"))
            }
          }
        })

        document.body.innerHTML = BillsUI({ error: "Erreur 500" })

        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })
  })
})