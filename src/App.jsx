import { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "./App.css";

function App() {
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState("");
  const [fileName, setFileName] = useState("");
  const [emails, setEmails] = useState([]);

  // handle textarea input
  function handleMsg(evt) {
    setMsg(evt.target.value);
  }

  // parse Excel file
  function readExcel(file) 
  {
    const reader = new FileReader();
    reader.onload = function (event) {
      const data = event.target.result;
      const workbook = XLSX.read(new Uint8Array(data), { type: "array" });
      const SheetName = workbook.SheetNames[0];
      const workSheet = workbook.Sheets[SheetName];
      const emaillist = XLSX.utils.sheet_to_json(workSheet, { header: "A" });
      const totalemail = emaillist.map(function(item){
        return item.A
      })
      console.log(totalemail)
      setEmails(totalemail)
    };
    reader.readAsArrayBuffer(file);
  }

  // handle file input click upload
  function handleFile(event) {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      readExcel(file);
    }
  }

  // handle drag and drop
  function handleDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setFileName(file.name);
      readExcel(file);
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  // send email via backend
  async function send() {
    try {
      const response = await axios.post("http://localhost:5000/sendemail", {
        msg,emails
      });
      setStatus(response.data.status);
      alert("Email sent successfully!");
    } catch (error) {
      console.error(error);
      setStatus("Error sending email");
      alert("Failed to send email.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-950 via-blue-700 to-blue-300 text-white font-sans">
      <header className="bg-blue-950 shadow-md">
        <h1 className="text-2xl md:text-3xl font-semibold py-4 text-center tracking-wide">
          BulkMail
        </h1>
      </header>

      <section className="bg-blue-800 text-center py-3 px-4">
        <p className="text-sm md:text-lg font-medium leading-relaxed">
          We help your business send multiple emails efficiently and securely.
        </p>
      </section>

      <main className="flex flex-col items-center justify-center flex-grow bg-blue-600 py-10 px-5 sm:px-8">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center">
          Drag and Drop
        </h2>

        <textarea
          onChange={handleMsg}
          value={msg}
          className="w-full max-w-xl h-32 sm:h-40 rounded-lg p-3 text-black border border-gray-300 shadow-sm outline-none focus:ring-2 focus:ring-blue-400 transition-all resize-none"
          placeholder="Enter the email text..."
        ></textarea>

        {/* File Drop Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="flex flex-col items-center justify-center mt-6 border-2 border-dashed border-white rounded-lg py-10 cursor-pointer hover:bg-blue-500 transition text-center w-full max-w-xl"
        >
          <input
            type="file"
            onChange={handleFile}
            className="hidden"
            id="fileInput"
          />
          <label
            htmlFor="fileInput"
            className="text-white font-medium text-sm sm:text-base"
          >
            Click or drag file here to upload
          </label>

          {fileName && (
            <p className="mt-3 text-xs sm:text-sm text-white/80">
              Uploaded: {fileName}
            </p>
          )}
        </div>

        <p className="mt-3 text-sm sm:text-base text-white/90">
          Total Emails in the file: {emails.length}
        </p>

        <button
          onClick={send}
          className="mt-6 bg-blue-950 hover:bg-blue-900 py-2 px-6 rounded-md font-semibold text-white shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Send
        </button>

        {status && <p className="mt-4 text-white">{status}</p>}
      </main>

      <footer className="bg-blue-300 py-6 text-center text-blue-950 font-medium px-4">
        <p className="text-sm sm:text-base">
          Need help? Contact our support team anytime.
        </p>
      </footer>

      <div className="bg-blue-200 text-center py-3 text-blue-950 text-xs sm:text-sm">
        <p>© 2025 BulkMail Inc. All rights reserved.</p>
      </div>
    </div>
  );
}

export default App;
