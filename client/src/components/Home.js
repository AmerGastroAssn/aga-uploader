import React, { Component } from "react";
import axios from "axios";
import $ from "jquery";
import "./Home.css";

import ReactTable from "react-table";
import "react-table/react-table.css";

// Sweet Alert
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null,
      selectedFiles: null,
      fileLocation: null,
      multifileLocation: [],
      deleteFile: null,
      deleted: false,
      currentItems: [],
      deleteSpecificToggle: false
    };
  }
  singleFileChangedHandler = event => {
    this.setState({
      selectedFile: event.target.files[0]
    });
  };
  multipleFileChangedHandler = event => {
    this.setState({
      selectedFiles: event.target.files
    });
    console.log(event.target.files);
  };
  singleFileUploadHandler = () => {
    const data = new FormData();
    // If file selected
    if (this.state.selectedFile) {
      data.append(
        "profileImage",
        this.state.selectedFile,
        this.state.selectedFile.name
      );
      axios
        .post("/api/profile/profile-img-upload", data, {
          headers: {
            accept: "application/json",
            "Accept-Language": "en-US,en;q=0.8",
            "Content-Type": `multipart/form-data; boundary=${data._boundary}`
          }
        })
        .then(response => {
          if (200 === response.status) {
            // If file size is larger than expected.
            if (response.data.error) {
              if ("LIMIT_FILE_SIZE" === response.data.error.code) {
                this.ocShowAlert("Max size: 2MB", "red");
              } else {
                console.log(response.data);
                // If not the given file type
                this.ocShowAlert(response.data.error, "red");
              }
            } else {
              // Success
              let fileName = response.data;
              console.log("fileName", fileName);
              this.setState({
                fileLocation: fileName.location
              });
              this.ocShowAlert("File Uploaded", "#3089cf");
            }
          }
        })
        .catch(error => {
          // If another error
          this.ocShowAlert(error, "red");
        });
    } else {
      // if file not selected throw error
      this.ocShowAlert("Please upload file", "red");
    }
  };
  multipleFileUploadHandler = () => {
    const data = new FormData();
    let selectedFiles = this.state.selectedFiles;
    // If file selected
    if (selectedFiles) {
      for (let i = 0; i < selectedFiles.length; i++) {
        data.append("galleryImage", selectedFiles[i], selectedFiles[i].name);
      }
      axios
        .post("/api/profile/multiple-file-upload", data, {
          headers: {
            accept: "application/json",
            "Accept-Language": "en-US,en;q=0.8",
            "Content-Type": `image/png; boundary=${data._boundary}`
          }
        })
        .then(response => {
          console.log("res", response);
          if (200 === response.status) {
            // If file size is larger than expected.
            if (response.data.error) {
              if ("LIMIT_FILE_SIZE" === response.data.error.code) {
                this.ocShowAlert("Max size: 2MB", "red");
              } else if ("LIMIT_UNEXPECTED_FILE" === response.data.error.code) {
                this.ocShowAlert("Max 4 images allowed", "red");
              } else {
                // If not the given ile type
              }
            } else {
              // Success
              let fileName = response.data;
              console.log("fileName", fileName);
              this.setState({
                multifileLocation: fileName.locationArray
              });
              console.log(fileName);
              this.ocShowAlert("File Uploaded", "#3089cf");
            }
          }
        })
        .catch(error => {
          // If another error
          this.ocShowAlert(error, "red");
        });
    } else {
      // if file not selected throw error
      this.ocShowAlert("Please upload file", "red");
    }
  };
  // ShowAlert Function
  ocShowAlert = (message, background = "#3089cf") => {
    let alertContainer = document.querySelector("#oc-alert-container"),
      alertEl = document.createElement("div"),
      textNode = document.createTextNode(message);
    alertEl.setAttribute("class", "oc-alert-pop-up");
    $(alertEl).css("background", background);
    alertEl.appendChild(textNode);
    alertContainer.appendChild(alertEl);
    setTimeout(function() {
      $(alertEl).fadeOut("slow");
      $(alertEl).remove();
    }, 3000);
  };

  deleteFiles = () => {
    this.setState({ deleted: !this.state.deleted });
    axios
      .delete(
        `api/profile/multiple-file-upload?delete=${this.state.deleteFile}`
      )
      .then(response => {
        console.log("initiated Delete");
      });
  };

  deleteSpecific = buttonLink => {
    let link = buttonLink;
    let cleanLink = link.slice(7, link.length);
    // axios
    //   .delete(`api/profile/multiple-file-upload?delete=${cleanLink}`)
    //   .then(response => {
    //     console.log("initiated Delete");
    //   });

    this.setState({ deleteSpecificToggle: !this.state.deleteSpecificToggle });
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then(result => {
      if (result.value) {
        axios
          .delete(`api/profile/multiple-file-upload?delete=${cleanLink}`)
          .then(response => {
            console.log("initiated Delete");
          });
        Swal.fire("Deleted!", "Your file has been deleted.", "success");
      }
    });
  };

  // Delete input Handler
  inputDeleteHandler = e => {
    e.preventDefault();
    this.setState({
      deleteFile: e.target.value,
      deleted: false
    });
    console.log(this.state.deleteFile);
  };

  componentDidMount() {
    // get current items list
    axios.get(`api/profile/list-all-items`).then(response => {
      console.log(response.data.Contents);
      let newItems = response.data.Contents.slice(1);
      this.setState({
        currentItems: newItems
      });
    });
  }
  render() {
    console.log(this.state);
    const columns = [
      {
        Header: "Image Location",
        headerClassName: "my-favorites-column-header-group",
        style: {
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "left"
        },
        Cell: row => {
          console.log("ROW", row);
          return (
            <div>
              <a
                href={`https://s3.amazonaws.com/agapiranha/${row.original.Key}`}
              >{`https://s3.amazonaws.com/agapiranha/${row.original.Key}`}</a>
            </div>
          );
        }
      },

      {
        Header: "Image Preview",
        headerClassName: "my-favorites-column-header-group",
        style: {
          textAlign: "center"
        },
        width: 150,
        maxWidth: 150,
        minWidth: 150,
        Cell: row => {
          return (
            <a href={`https://s3.amazonaws.com/agapiranha/${row.original.Key}`}>
              <img
                width="100"
                src={`https://s3.amazonaws.com/agapiranha/${row.original.Key}`}
              />
            </a>
          );
        },
        id: "status"
      },
      {
        Header: "Delete",
        headerClassName: "my-favorites-column-header-group",
        style: {
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        },
        Cell: row => {
          return (
            <button
              className="btn btn-danger"
              onClick={() => {
                this.deleteSpecific(row.original.Key);
              }}
            >
              Delete
            </button>
          );
        },
        width: 100,
        maxWidth: 100,
        minWidth: 100
      }
    ];
    return (
      <div>
        <nav className="navbar navbar-light mt-4">
          <span className="navbar-brand mb-0 h1 ml-5">
            <img
              src="/aga-logo.png"
              width="100"
              style={{ marginRight: "5px", marginLeft: "5px" }}
              alt="logo"
            />
            <span className="primary-italic">File Uploader</span>
          </span>

          {/* About Modal Start */}
          <div className="float-right mr-4">
            <button
              type="button"
              className="btn btn-primary"
              data-toggle="modal"
              data-target="#exampleModalLong"
            >
              About the App
            </button>

            <div
              className="modal fade"
              id="exampleModalLong"
              tabIndex="-1"
              role="dialog"
              aria-labelledby="exampleModalLongTitle"
              aria-hidden="true"
            >
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLongTitle">
                      About
                    </h5>
                    <button
                      type="button"
                      className="close"
                      data-dismiss="modal"
                      aria-label="Close"
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    This app connects to our AWS S3 Database server folder
                    directly making it easier for us to upload and delete
                    specific files.
                    <br /> <br />
                    Main function of the app:
                    <ul>
                      <li>Upload</li>
                      <li>Delete</li>
                    </ul>
                    <br />
                    The Upload Board contains a file uploader button. You can
                    choose up to 4 files at a time and max size for a file is
                    2MB. After uploading file/files the Upload Board will reveal
                    it's location right away for ease of use.
                    <br />
                    <br />
                    The Table at the bottom visually shows all the files that
                    are in our S3 bucket along with its file location for easy
                    copy/paste use and image preview. The table also consists of
                    the delete button so if a file is no longer needed and needs
                    to be deleted we can simply click on the delete button to
                    remove the specific file.
                    <br />
                    <br />
                    Tutorial link: coming soon
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-dismiss="modal"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About Modal End */}
        </nav>
        <div className="container">
          {/* For Alert box*/} <div id="oc-alert-container"> </div>
          {/* Upload Image Box Start */}
          <div
            className="card border-light mb-3 mt-5"
            style={{
              boxShadow: "0 5px 10px 2px rgba(195,192,192,.5)"
            }}
          >
            <div className="card-header upload single-head-design">
              <h3
                style={{
                  color: "#fff",
                  marginLeft: "12px"
                }}
              >
                Upload Images
              </h3>
              <i className="fas fa-cloud-upload-alt float-right fa-3x text-success" />
              <p
                className="text-success"
                style={{
                  marginLeft: "12px"
                }}
              >
                Upload Size: Max 2 MB
              </p>
            </div>
            <div className="card-body">
              <p className="card-text">
                Please upload the Gallery Images for your gallery
              </p>
              <input
                type="file"
                multiple
                onChange={this.multipleFileChangedHandler}
              />

              <div className="mt-3">
                <span className="font-weight-bold mb-3">
                  Your file locations are:
                </span>
                <span className="font-italic">
                  {this.state.multifileLocation.map((location, id) => (
                    <p key={id}>{location}</p>
                  ))}
                </span>
              </div>
              <div className="mt-5">
                <button
                  className="btn btn-success"
                  onClick={this.multipleFileUploadHandler}
                >
                  Upload!
                </button>
              </div>
            </div>
          </div>
          {/* Upload Image Box End */}
          {/* Current Folder Container Start */}
          {/* <div className="mt-5 mb-5">
            <h5>AWS S3 Photos folder contains:</h5>
            <table className="table ">
              <thead className="table-head-design ">
                <tr>
                  <th
                    scope="col"
                    className="text-white rounded-left border-cancel"
                  >
                    Image Location
                  </th>
                  <th scope="col" className="text-white border-cancel">
                    Image Preview
                  </th>
                  <th
                    scope="col"
                    className="text-white rounded-right border-cancel"
                  >
                    Delete
                  </th>
                </tr>
              </thead>
              <tbody>
                {this.state.currentItems.map((item, index) => (
                  <tr key={index}>
                    <td className="border-cancel row-border">
                      <a
                        href={`https://s3.amazonaws.com/agapiranha/${item.Key}`}
                        target="_blank"
                      >{`https://s3.amazonaws.com/agapiranha/${item.Key}`}</a>
                    </td>
                    <td className="border-cancel row-border">
                      <a
                        href={`https://s3.amazonaws.com/agapiranha/${item.Key}`}
                        target="_blank"
                      >
                        <img
                          alt="project"
                          width="100"
                          src={`https://s3.amazonaws.com/agapiranha/${
                            item.Key
                          }`}
                        />
                      </a>
                    </td>
                    <td className="border-cancel row-border">
                      <button
                        className="btn btn-danger"
                        onClick={() => {
                          this.deleteSpecific(item.Key);
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div> */}
          {/* Current Folder Container End */}
          {/* React Table Start */}
          <ReactTable
            columns={columns}
            data={this.state.currentItems}
            defaultPageSize={10}
          />
          {/* React Table End */}
        </div>
      </div>
    );
  }
}
export default Home;
