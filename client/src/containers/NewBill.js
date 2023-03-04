import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    this.form = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    );
    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener("change", this.handleChangeFile);
    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
    new Logout({ document, localStorage, onNavigate });
  }
  handleChangeFile = (e) => {
    //Bug Hunt 1 - Source of the bug was a lack of verification on the file extension.
    //therefore a verification was added, with a message to notify when a wrong extension was used 
    e.preventDefault();
    const file = this.document.querySelector(`input[data-testid="file"]`)
      .files[0];
    const acceptedExtension = ["jpg", "jpeg", "png"] // array of accepted extension, can be easyly modified
    const filePath = e.target.value.split(/\\/g);
    const fileName = filePath[filePath.length - 1];
    const fileType = file.name.split(".")[1];
    const message = document.querySelector("form p")
    const formData = new FormData();
    message && message.remove()

    if (
      acceptedExtension.includes(fileType)
    ) {
      const email = JSON.parse(localStorage.getItem("user")).email;
      formData.append("file", file);
      formData.append("email", email);
      this.form.addEventListener("submit", this.handleSubmit);
      this.store
        .bills()
        .create({
          data: formData,
          headers: {
            noContentType: true,
          },
        })
        .then(({ fileUrl, key }) => {
          console.log(fileUrl);
          console.log(key);
          console.log(e)
          this.billId = key;
          this.fileUrl = fileUrl;
          this.fileName = fileName;

        })
        .catch((error) => console.error(error));
    } else {
      const input = document.querySelector('input[type="file"]')
      const inputParent = input.parentNode;
      const errorMessage = document.createElement("p")
      errorMessage.setAttribute("data-testid", "error-message")
      errorMessage.textContent = "Vous devez choisir un fichier de type JPEG, JPG ou PNG"
      inputParent.appendChild(errorMessage)
      this.form.removeEventListener("submit", this.handleSubmit);
    }
  };
  handleSubmit = (e) => {
    e.preventDefault();

    const email = JSON.parse(localStorage.getItem("user")).email;
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`)
        .value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`)
        .value,
      amount: parseInt(
        e.target.querySelector(`input[data-testid="amount"]`).value
      ),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct:
        parseInt(
          e.target.querySelector(`input[data-testid="pct"]`).value
        ) || 20,
      commentary: e.target.querySelector(
        `textarea[data-testid="commentary"]`
      ).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: "pending",
    };
    this.updateBill(bill);
    this.onNavigate(ROUTES_PATH["Bills"]);
  };

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) => console.error(error));
    }
  };
}
