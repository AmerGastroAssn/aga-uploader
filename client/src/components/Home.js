import React, { Component } from "react";
import axios from "axios";
import $ from "jquery";
import "./Home.css";

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
            "Content-Type": `multipart/form-data; boundary=${data._boundary}`
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

    return (
      <div>
        <nav className="navbar navbar-light mt-4">
          <span className="navbar-brand mb-0 h1 main-logo ml-5">
            <span className="font-weight-bold">AGA </span>File Uploader
          </span>
          <span className="mr-3">
            for
            <img
              src="/aga-logo.png"
              width="50"
              style={{ marginRight: "5px", marginLeft: "5px" }}
              alt="logo"
            />
            use
          </span>
        </nav>
        <div className="container">
          {/* For Alert box*/} <div id="oc-alert-container"> </div>
          <div className="mt-5">
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
                      <div>{`https://s3.amazonaws.com/agapiranha/${
                        item.Key
                      }`}</div>
                    </td>
                    <td className="border-cancel row-border">
                      <img
                        alt="project"
                        width="100px"
                        src={`https://s3.amazonaws.com/agapiranha/${item.Key}`}
                      />
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
          </div>
          {/* Single File Upload*/}
          <div
            className="card border-light mb-5 mt-5"
            style={{
              boxShadow: "0 5px 10px 2px rgba(195,192,192,.5)"
            }}
          >
            <div className="card-header upload single-head-design">
              <h3
                style={{
                  color: "#292929",
                  marginLeft: "12px"
                }}
              >
                Single Image Upload
              </h3>
              <i className="fas fa-cloud-upload-alt float-right fa-3x text-success" />
              <p
                className="text-muted"
                style={{
                  marginLeft: "12px"
                }}
              >
                Upload Size: 250 px x 250 px(Max 2 MB)
              </p>
            </div>
            <div className="card-body">
              <p className="card-text">
                Please upload an image for your profile
              </p>
              <input type="file" onChange={this.singleFileChangedHandler} />
              <p className="mt-3">
                {this.state.fileLocation ? (
                  <div>
                    <span className="font-weight-bold">
                      Your file location is:
                    </span>
                    <br />
                    <span className="font-italic">
                      {this.state.fileLocation}
                    </span>
                  </div>
                ) : null}

                <br />

                <br />
                {this.state.fileLocation ? (
                  <div>
                    <span className="mt-3 mb-2">
                      Preview of the uploaded image
                    </span>
                    <br />
                    <img
                      src={this.state.fileLocation}
                      height="200"
                      alt="preview of your uploaded file"
                    />
                  </div>
                ) : null}
              </p>
              <div className="mt-5">
                <button
                  className="btn btn-success"
                  onClick={this.singleFileUploadHandler}
                >
                  Upload!
                </button>
              </div>
            </div>
          </div>
          {/* Multiple File Upload */}
          <div
            className="card border-light mb-3"
            style={{
              boxShadow: "0 5px 10px 2px rgba(195,192,192,.5)"
            }}
          >
            <div className="card-header upload single-head-design">
              <h3
                style={{
                  color: "#292929",
                  marginLeft: "12px"
                }}
              >
                Upload Muliple Images
              </h3>
              <i className="fas fa-cloud-upload-alt float-right fa-3x text-success" />
              <p
                className="text-muted"
                style={{
                  marginLeft: "12px"
                }}
              >
                Upload Size: 400 px x 400 px(Max 2 MB)
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
          {/* Delete Single File  */}
          {/* Deprecated as of now */}
          {/* <div
            className="card border-light mb-5 mt-5"
            style={{
              boxShadow: "0 5px 10px 2px rgba(195,192,192,.5)"
            }}
          >
            <div className="card-header delete delete-head-design">
              <h3
                style={{
                  color: "#292929",
                  marginLeft: "12px"
                }}
              >
                Delete Single File
              </h3>
              <i className="fas fa-trash-alt float-right fa-3x text-danger" />
            </div>
            <div className="card-body">
              <form method="delete">
                <input
                  size="35"
                  type="text"
                  onChange={this.inputDeleteHandler}
                  name="delete"
                />
              </form>

              <p className="mt-3">
                <span className="font-weight-bold">
                  {this.state.deleted
                    ? `Successfully deleted ${this.state.deleteFile}!`
                    : null}
                </span>
                <br />
              </p>
              <div className="mt-5">
                <button className="btn btn-danger" onClick={this.deleteFiles}>
                  Delete
                </button>
              </div>
            </div>
          </div> */}
          {/* Delete End */}
        </div>
      </div>
    );
  }
}
export default Home;
