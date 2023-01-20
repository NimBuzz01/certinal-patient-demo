import React, { useEffect, useState } from "react";
import axios from "axios";

import "./PatientList.css";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { AiOutlineCopyrightCircle } from "react-icons/ai";
import { FiRefreshCw } from "react-icons/fi";
import { MdPendingActions } from "react-icons/md";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";
import { BiSearchAlt } from "react-icons/bi";
import Swal from "sweetalert2";

export default function PatientList() {
  // const [patients, setPatients] = useState([]);
  const [expandedPatientId, setExpandedPatientId] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [patient, setPatient] = useState({});

  // useEffect(() => {
  //   fetch(
  //     "https://5103acf3-676a-4fde-a47e-ff86750f4962-dev.e1-us-east-azure.choreoapis.dev/cirr/certinalapi/1.0.0/patients"
  //   )
  //     .then((response) => response.json())
  //     .then((data) => {
  //       const patientsData = data.entry.map((patient) => {
  //         return {
  //           id: patient.resource.id,
  //           email: patient.resource.telecom[0].value,
  //           name: patient.resource.name[0].text,
  //           birthDate: patient.resource.birthDate,
  //         };
  //       });
  //       setPatients(patientsData);
  //     })
  //     .catch((error) => {
  //       console.error("Retrieving Patients", error);
  //     });
  // }, []);

  const [temp, setTemp] = useState("a");

  useEffect(() => {
    makeAPICalls();
  }, [patient]);

  const refreshPage = () => {
    makeAPICalls();
  };

  const refreshState = () => {
    if (temp === "a") {
      setTemp("b");
    } else {
      setTemp("a");
    }
  }

  const makeAPICalls = () => {
    // patients.forEach((patient) => {
    axios
      .get(
        `https://5103acf3-676a-4fde-a47e-ff86750f4962-dev.e1-us-east-azure.choreoapis.dev/cirr/certinalapi/1.0.0/isDocUploaded?patientId=` +
          patient.id
      )
      .then((response) => {
        if (response.status === 200) {
          console.log(`Patient ${patient.id} data received successfully.`);
          patient.isDocReady = true;
          patient.isPending = false;
          Swal.fire({
            text: patient.name + " signature found!",
            icon: "success",
            confirmButtonColor: "#00255C",
          });
          refreshState();
        } else {
          console.error(
            `Patient ${patient.id} request failed with status code ${response.status}.`
          );
          patient.isDocReady = false;
          Swal.fire({
            text: patient.name + " signature not found!",
            icon: "error",
            confirmButtonColor: "#00255C",
          });
          refreshState();
        }
      })
      .catch(console.error(`Patient ${patient.id} request failed.`));
    // });
  };

  function handleExpandClick(patient) {
    setExpandedPatientId(expandedPatientId === patient.id ? null : patient.id);
  }

  // sends email and id to api call and starts websocket to fetch transaction id
  const handleSendEmail = (patient) => {
    fetch(
      "https://5103acf3-676a-4fde-a47e-ff86750f4962-dev.e1-us-east-azure.choreoapis.dev/cirr/certinalapi/1.0.0/esign?patientId=" +
        patient.id +
        "&userEmail=" +
        patient.email
    )
      .then((response) => response.json())
      .then((data) => {
        patient.transactionId = data.data.transactionId;
        patient.isPending = true;
        Swal.fire({
          text: "Email Link sent to " + patient.email,
          icon: "success",
          confirmButtonColor: "#00255C",
        });
        refreshState();
      })
      .catch((error) => {
        console.error("Sending Email", error);
        Swal.fire({
          text: "Error sending email!",
          icon: "error",
          confirmButtonColor: "#00255C",
        });
        refreshState();
      });
  };

  function handleDocumentDownload(patient) {
    let timerInterval;
    Swal.fire({
      title: "Please wait... Your file is being downloaded!",
      timer: 3000,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
        const b = Swal.getHtmlContainer().querySelector("b");
        timerInterval = setInterval(() => {
          b.textContent = Swal.getTimerLeft();
        }, 100);
      },
      willClose: () => {
        clearInterval(timerInterval);
      },
    });
    // Api call to get document link
    axios
      .get(
        `https://5103acf3-676a-4fde-a47e-ff86750f4962-dev.e1-us-east-azure.choreoapis.dev/cirr/certinalapi/1.0.0/signeddoc?patientId=` +
          patient.id,
        {
          responseType: "blob",
        }
      )
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", patient.id + "-signeddoc.pdf");
        document.body.appendChild(link);
        link.click();
      });
  }

  function handleReportDownload(patient) {
    let timerInterval;
    Swal.fire({
      title: "Please wait... Your file is being downloaded!",
      timer: 3000,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
        const b = Swal.getHtmlContainer().querySelector("b");
        timerInterval = setInterval(() => {
          b.textContent = Swal.getTimerLeft();
        }, 100);
      },
      willClose: () => {
        clearInterval(timerInterval);
      },
    });
    // Api call to get report link
    axios
      .get(
        `https://5103acf3-676a-4fde-a47e-ff86750f4962-dev.e1-us-east-azure.choreoapis.dev/cirr/certinalapi/1.0.0/auditreport?patientId=` +
          patient.id,
        {
          responseType: "blob",
        }
      )
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", patient.id + "-auditreport.pdf");
        document.body.appendChild(link);
        link.click();
      });
  }

  const handleSearchChange = (e) => {
    e.preventDefault();
    setSearchInput(e.target.value);
  };

  const handleSearchClick = async () => {
    const response = await fetch(
      "https://5103acf3-676a-4fde-a47e-ff86750f4962-dev.e1-us-east-azure.choreoapis.dev/cirr/certinalapi/1.0.0/patient/" +
        searchInput
    );
    const data = await response.json();
    setPatient({
      id: data.id,
      email: data.telecom[0].value,
      name: data.name[0].text,
      birthDate: data.birthDate,
    });
  };

  return (
    <main>
      <h1 className="pg-title">Practitioner View</h1>
      <div className="utils">
        <div className="search-bar">
          <p>Search Patient:</p>
          <input
            type="text"
            placeholder="Enter Patient ID"
            onChange={handleSearchChange}
            value={searchInput}
          />
          <BiSearchAlt onClick={handleSearchClick} className="search-btn" />
        </div>
        {/* <button onClick={makeAPICalls} className="fetch-btn">
          Fetch Data
        </button> */}
        <p style={{ color: "#fff", fontSize: "1px" }}>{temp}</p>
        <FiRefreshCw onClick={refreshPage} className="refresh-btn" />
      </div>

      <div className="patient-list">
        {/* {patients.map((patient) => ( */}
        {patient.id > 0 && (
          <div key={patient.id} className="patient">
            <div className="row">
              <p className="patient-name">
                Patient Name: <span>{patient.name}</span>
              </p>
              <div className="status-container">
                {patient.isPending ? (
                  <p>
                    <MdPendingActions color="orange" fontSize={"30px"} />{" "}
                    Pending Signature
                  </p>
                ) : patient.isDocReady ? (
                  <p>
                    <IoCheckmarkDoneCircleSharp
                      color="green"
                      fontSize={"30px"}
                    />{" "}
                    Signature Obtained
                  </p>
                ) : (
                  <p>Signature Not Found</p>
                )}
              </div>

              <button
                className="toggle-btn"
                onClick={() => handleExpandClick(patient)}
              >
                {expandedPatientId === patient.id && expandedPatientId ? (
                  <BsChevronUp />
                ) : (
                  <BsChevronDown />
                )}
              </button>
            </div>
            <div className="row">
              {expandedPatientId === patient.id && (
                <div className="info-modal">
                  <div>
                    <p>
                      <span>Patient ID:</span> {patient.id}
                    </p>
                    <p>
                      <span>Email:</span> {patient.email}
                    </p>
                    <p>
                      <span>Birthdate:</span> {patient.birthDate}
                    </p>
                    <p>
                      <span style={{ marginRight: "0.2em" }}>
                        Is Document Ready:{" "}
                      </span>
                      {patient.isDocReady ? String("Yes") : String("No")}
                    </p>
                  </div>
                  <div className="btn-container">
                    <button
                      className="btn"
                      id="email-btn"
                      disabled={patient.isDocReady}
                      onClick={() => handleSendEmail(patient)}
                    >
                      Send Email Link
                    </button>
                    <button
                      className="btn"
                      disabled={!patient.isDocReady}
                      onClick={() => handleDocumentDownload(patient)}
                    >
                      Download Signed Document
                    </button>
                    <button
                      className="btn"
                      disabled={!patient.isDocReady}
                      onClick={() => handleReportDownload(patient)}
                    >
                      Download Audit Report
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ))} */}
      </div>

      <footer className="footer-container">
        <AiOutlineCopyrightCircle />
        <p> 2023 WSO2 LLC | All Rights Reserved</p>
      </footer>
    </main>
  );
}
