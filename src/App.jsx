import { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "./App.css";

function App() {
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState("");
  const [fileName, setFileName] = useState("");
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);

  // handle textarea input
  function handleMsg(evt) {
    setMsg(evt.target.value);
  }

  // parse Excel file
  function readExcel(file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const data = event.target.result;
      const workbook = XLSX.read(new Uint8Array(data), { type: "array" });
      const SheetName = workbook.SheetNames[0];
      const workSheet = workbook.Sheets[SheetName];
      const emaillist = XLSX.utils.sheet_to_json(workSheet, { header: "A" });
      
      // Extract emails and filter out empty/invalid ones
      const totalemail = emaillist
        .map(function(item) {
          return item.A;
        })
        .filter(function(email) {
          return email && 
                 typeof email === 'string' && 
                 email.trim() !== '' && 
                 email.includes('@');
        });
      
      console.log("Parsed emails:", totalemail);
      setEmails(totalemail);
      
      if (totalemail.length === 0) {
        alert("No valid email addresses found in the file!");
      }
    };
    reader.readAsArrayBuffer(file);
  }

  // handle file input click upload
  function handleFile(event) {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      
      if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        alert("Please upload a valid Excel file (.xlsx or .xls)");
        return;
      }
      
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
    // Validation
    if (!msg.trim()) {
      alert("Please enter a message!");
      return;
    }
    
    if (emails.length === 0) {
      alert("Please upload a file with email addresses!");
      return;
    }

    setLoading(true);
    setStatus("Sending emails...");

    try {
      const response = await axios.post("http://localhost:5000/sendemail", {
        msg,
        emails
      });
      
      console.log("Response:", response.data);
      
      setStatus(response.data.status);
      
      if (response.data.success) {
        alert(`✅ Success!\n${response.data.status}`);
      } else {
        alert(`⚠️ ${response.data.status}`);
      }
      
    } catch (error) {
      console.error("Error:", error);
      
      const errorMessage = error.response?.data?.status || 
                          error.response?.data?.message || 
                          "Failed to send emails. Please check your connection.";
      
      setStatus(errorMessage);
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-950 via-blue-700 to-blue-300 text-white font-sans">
      <header className="bg-blue-950 shadow-md">
        <h1 className="text-2xl md:text-3xl font-semibold py-4 text-center tracking-wide">
          📧 BulkMail
        </h1>
      </header>

      <section className="bg-blue-800 text-center py-3 px-4">
        <p className="text-sm md:text-lg font-medium leading-relaxed">
          We help your business send multiple emails efficiently and securely.
        </p>
      </section>

      <main className="flex flex-col items-center justify-center flex-grow bg-blue-600 py-10 px-5 sm:px-8">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center">
          📝 Compose Your Message
        </h2>

        <textarea
          onChange={handleMsg}
          value={msg}
          disabled={loading}
          className="w-full max-w-xl h-32 sm:h-40 rounded-lg p-3 text-black border border-gray-300 shadow-sm outline-none focus:ring-2 focus:ring-blue-400 transition-all resize-none disabled:bg-gray-200 disabled:cursor-not-allowed"
          placeholder="Enter the email text..."
        ></textarea>

        <h2 className="text-lg sm:text-xl font-semibold mb-4 mt-8 text-center">
          📎 Upload Email List
        </h2>

        {/* File Drop Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="flex flex-col items-center justify-center border-2 border-dashed border-white rounded-lg py-10 cursor-pointer hover:bg-blue-500 transition text-center w-full max-w-xl"
        >
          <input
            type="file"
            onChange={handleFile}
            className="hidden"
            id="fileInput"
            accept=".xlsx,.xls"
            disabled={loading}
          />
          <label
            htmlFor="fileInput"
            className="text-white font-medium text-sm sm:text-base cursor-pointer"
          >
            📂 Click or drag Excel file here to upload
          </label>

          {fileName && (
            <p className="mt-3 text-xs sm:text-sm text-white/80 bg-blue-700 px-3 py-1 rounded">
              ✅ Uploaded: {fileName}
            </p>
          )}
        </div>

        <p className="mt-3 text-sm sm:text-base text-white/90 font-semibold">
          📊 Total Valid Emails: {emails.length}
        </p>

        <button
          onClick={send}
          disabled={loading || emails.length === 0 || !msg.trim()}
          className="mt-6 bg-blue-950 hover:bg-blue-900 py-3 px-8 rounded-md font-semibold text-white shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? "⏳ Sending..." : "🚀 Send Emails"}
        </button>

        {status && (
          <div className="mt-4 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg">
            <p className="text-white text-sm sm:text-base">{status}</p>
          </div>
        )}
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