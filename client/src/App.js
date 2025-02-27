import React, { Component } from "react";
import Axios from "axios";
import Cookies from "universal-cookie";
import { FormCountContext } from "./context/index";
//components
import Header from "./components/Header/Header";
import TreatmentPlan72 from "./components/Forms/TreatmentPlan72";
import IncidentReport from "./components/Forms/IncidentReport";
import SeriousIncidentReport from "./components/Forms/SeriousIncidentReport";
import RestraintReport from "./components/Forms/RestraintReport";
import DailyProgress from "./components/Forms/DailyProgressAndActivity";
import AnnualTraining from "./components/Forms/AnnualTraining";
import MessageBoard from "./components/MessageBoard/MessageBoard";
import Reports from "./components/Reports/ReportsContainer";
import UserManagement from "./components/UserManagement/UserManagement";
import BSNavBar from "./components/NavBar/bsNavBar";
import DirectMessageBoard from "./components/DirectMessageBoard/DirectMessageBoard";
import Modal from "react-bootstrap/Modal";
import ModalBody from "react-bootstrap/ModalBody";
import ModalHeader from "react-bootstrap/ModalHeader";
import Clients from "./components/Clients/Clients";
import FormAlert from "./components/Forms/FormAlert";
import Documents from "./components/Documents/Documents";
import IllnessInjury from "./components/Forms/IllnessInjury";
import AdmissionAssessment from "./components/Forms/AdmissionAssessment";
import BodyCheck from "./components/Forms/BodyCheck";
import OrientationTraining from "./components/Forms/OrientationTraining";
import PreServiceTraining from "./components/Forms/PreServiceTraining";
import FirstAidCprTraining from "./components/Forms/FirstAidCprTraining";
import ManageAccountContainer from "./components/ManageAccount/ManageAccountContainer";
import AwakeNightStaffSignoff from "./components/Forms/AwakeNightStaffSignoff";
import rightBody from "./images/right_body.png";
import leftBody from "./images/left_body.png";
import "./App.css";
import Fade from "react-reveal/Fade";
import ManageTraining from "./components/ManageTraining/ManageTraining";
import { isAdminUser } from "./utils/AdminReportingRoles";
import NightMonitoring from "./components/Forms/NightMonitoring";

const hideStyle = {
  display: "none",
};

const cookies = new Cookies();

class App extends Component {
  state = {
    loggedIn: false,
    userObj: {},
    messagesInitLoad: false,
    allUsersSet: false,
    errorModalMeta: {
      title: "",
      message: "",
    },
    doDisplay: "Dashboard",
    discussionMessages: [],
    allUsers: [],
    showLearnMore: false,
    name: "",
    organization: "",
    emailTo: "",
    emailSent: false,
    dmTo: null,
    blockCompUpdates: false,
    toUserSelected: null,
    dmMessage: "",
    messages: [],
    discussionMessagesLoading: true,
    showUploadModal: false,
    showClients: true,
    showTrainings: true,
    nonApprovedFormCountSet: false,
    formCountState: {
      count: -1,
      updateCount: this.doFetchFormApprovalCount,
    },
    flip: false,
    showMessageSent: false,
  };

  doFetchFormApprovalCount = async () => {
    try {
      this.setState({
        ...this.state,
        formCountState: {
          ...this.state.formCountState,
          count: -1,
        },
        nonApprovedFormCountSet: false,
      });
      const { data } = await Axios.get(
        `/api/forms/count/false/${this.state.userObj.homeId}`
      );

      const { count: nonApprovedFormCount } = data;

      this.setState({
        ...this.state,
        nonApprovedFormCountSet: true,
        formCountState: {
          ...this.state.formCountState,
          count: nonApprovedFormCount,
          updateCount: async () => {
            const { data } = await Axios.get(
              `/api/forms/count/false/${this.state.userObj.homeId}`
            );
            const { count: nonApprovedFormCount } = data;
            this.setState({
              ...this.state,
              nonApprovedFormCountSet: true,
              flip: !this.state.flip,
              formCountState: {
                ...this.state.formCountState,
                count: nonApprovedFormCount,
              },
            });
          },
        },
      });
    } catch (e) {
      console.log(`Error fetching form count - ${e}`);
    }
  };

  getMyMessages = () => {
    Axios.get(
      `/api/directMessages/${this.state.userObj.email}/${this.state.userObj.homeId}`
    ).then((messages) => {
      this.setState({ messages: messages.data });
    });
  };

  setDmToUser = async (id) => {
    const selectedUser = this.state.allUsers.filter((user) => {
      return user._id === id;
    });

    await this.setState({
      ...this.state,
      dmTo: selectedUser.length > 0 ? selectedUser[0] : null,
    });
  };

  componentDidMount = async () => {
    let userObj = cookies.get("userObj");
    let loggedIn = cookies.get("loggedIn");
    if (userObj && loggedIn) {
      try {
        await this.setState({
          userObj,
          loggedIn: loggedIn,
        });
        const { data: updatedUserData } = await Axios({
          method: "get",
          url: "/api/users/" + userObj.email + "/" + userObj.password,
        });
        await this.setState({
          userObj: updatedUserData,
        });

        if (isAdminUser(this.state.userObj)) {
          await this.doFetchFormApprovalCount();
        }

        this.loadMessage(updatedUserData);
        await this.getAllUsers();
        await this.getMyMessages();
      } catch (e) {
        console.log(e);
        await this.setState({
          userObj: {},
          loggedIn: false,
        });
        return;
      }
    }
  };

  componentDidUpdate = () => {
    if (
      this.state.loggedIn &&
      (this.state.allUsersSet === false || this.state.allUsers.length === 0)
    ) {
      this.getAllUsers();
    }

    if (
      !this.state.messagesInitLoad &&
      !this.state.blockCompUpdates &&
      this.state.isLoggedIn
    ) {
      this.loadMessage(this.state.userObj);
    }
  };

  loadMessage = (userObj) => {
    this.setState({
      ...this.state,
      discussionMessagesLoading: true,
    });
    Axios.get(`/api/discussionMessages/${userObj.homeId}`)
      .then((response) => {
        setTimeout(() => {
          this.setState({
            discussionMessages: response.data,
            messagesInitLoad: true,
            discussionMessagesLoading: false,
          });
        }, 1000);
      })
      .catch((error) => {
        this.setState({
          discussionMessagesLoading: false,
        });
        alert(error);
      });
  };

  appendMessage = async (message) => {
    let newMessage = {
      message: message,
      firstName: this.state.userObj.firstName,
      middleName: this.state.userObj.middleName,
      lastName: this.state.userObj.lastName,
      id: this.state.userObj._id,
      homeId: this.state.userObj.homeId,
      date: new Date().toISOString(),
    };
    try {
      await Axios.post("/api/discussionMessages", newMessage);
      this.loadMessage(this.state.userObj);
    } catch (e) {
      alert("Error loading messages");
      console.log(e);
    }
  };

  removeMessage = (id) => {
    let messages = this.state.discussionMessages.filter((messageObj) => {
      return messageObj._id !== id;
    });

    return messages;
  };

  setDMs = (messages) => {
    this.setState({ ...this.state, messages });
  };

  showErrorModal = (title, message) => {
    this.setState({ message: message });
    this.setState({ title: title });
  };

  getAllUsers = () => {
    Axios.get("/api/users/" + this.state.userObj.homeId).then((allUsers) => {
      this.setState({ allUsers: allUsers.data, allUsersSet: true });
    });
  };

  logOut = () => {
    this.setState({
      ...this.state,
      loggedIn: false,
      userObj: {},
      doDisplay: "Dashboard",
      allUsersSet: false,
      blockCompUpdates: false,
      nonApprovedFormCountSet: false,
    });
    cookies.remove("loggedIn", { path: "/" });
    cookies.remove("userObj", { path: "/" });
    window.scrollTo(0, 0);
  };

  scrollTop = () => {
    window.scrollTo(0, 0);
  };

  toggleLogIn = async (userObj) => {
    window.scrollTo(0, 0);
    let message = "";
    let title = "";
    if (userObj.newUser) {
      message =
        "You need to reset your password. Click the Manage Profile button to do so.";
      title = "Welcome to RCS, Heres some information";
    }
    await this.setState({
      userObj: userObj,
      loggedIn: true,
      message,
      title,
    });
    this.getMyMessages();
    this.loadMessage(userObj);
    if (isAdminUser(userObj)) {
      this.doFetchFormApprovalCount();
    }

    let cookieToSet = { ...this.state };
    delete cookieToSet.discussionMessages;
    delete cookieToSet.allUsers;
    delete cookieToSet.messagesInitLoad;
    delete cookieToSet.allUsersSet;
    delete cookieToSet.errorModalMeta;
    delete cookieToSet.doDisplay;
    delete cookieToSet.discussionMessages;
    delete cookieToSet.allUsers;
    delete cookieToSet.showLearnMore;
    delete cookieToSet.name;
    delete cookieToSet.organization;
    delete cookieToSet.emailTo;
    delete cookieToSet.emailSent;
    delete cookieToSet.dmTo;
    delete cookieToSet.blockCompUpdates;
    delete cookieToSet.toUserSelected;
    delete cookieToSet.dmMessage;
    delete cookieToSet.messages;
    delete cookieToSet.discussionMessagesLoading;
    delete cookieToSet.showUploadModal;
    delete cookieToSet.showClients;
    delete cookieToSet.showTrainings;

    delete cookieToSet.userObj.signature; // messes up cookie storage
    const current = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(current.getFullYear() + 1);
    await cookies.set("userObj", JSON.stringify(cookieToSet.userObj), {
      expires: nextYear,
    });
    await cookies.set("loggedIn", cookieToSet.loggedIn, { expires: nextYear });
  };

  toggleDisplay = (display) => {
    window.scrollTo(0, 0);
    this.setState({ doDisplay: display });
  };

  handleFieldInput = (event) => {
    var stateObj = {};
    stateObj[event.target.id] = event.target.value;
    this.setState(stateObj);
  };

  toggleLearnMore = () => {
    this.setState({
      showLearnMore: !this.state.showLearnMore,
      blockCompUpdates: !this.state.blockCompUpdates,
    });
  };

  sendEmail = () => {
    var thisHook = this;
    if (this.state.emailTo === "") {
      return;
    }
    thisHook.setState({ blockCompUpdates: true });
    Axios.post(
      `/api/email/${this.state.emailTo}/${this.state.name}/${
        this.state.organization ? this.state.organization : "null"
      }`
    )
      .then(function (response) {
        thisHook.setState({
          name: "",
          emailTo: "",
          organization: "",
          emailSent: true,
          showLearnMore: false,
        });
        setTimeout(() => {
          thisHook.setState({ emailSent: false });
          setTimeout(() => {
            thisHook.setState({ blockCompUpdates: false });
          }, 4000);
        }, 4000);
      })
      .catch(function (error) {
        alert("error sending email");
        console.log(error);
      });
  };

  sendDM = async () => {
    if (
      this.state.dmTo !== "" ||
      (this.state.dmTo !== null && this.state.dmMessage)
    ) {
      try {
        await Axios.post(`/api/directMessages`, {
          toObj: this.state.dmTo,
          fromObj: this.state.userObj,
          toID: this.state.dmTo.email,
          fromID: this.state.userObj.email,
          message: this.state.dmMessage,
          date: new Date(),
          homeId: this.state.userObj.homeId,
        });

        this.setState({
          ...this.state,
          showMessageSent: true,
          dmMessage: "",
        });

        const { data } = await Axios.get(
          `/api/directMessages/${this.state.userObj.email}/${this.state.userObj.homeId}`
        );

        this.setState({
          ...this.state,
          messages: data,
        });

        setTimeout(() => {
          this.setState({
            ...this.state,
            showMessageSent: false,
          });
        }, 2000);
      } catch (e) {
        alert("Error sending message");
        this.setState({
          ...this.state,
          showMessageSent: false,
        });
        console.log(e);
      }
    }
  };

  setDmMessage = (message) => {
    this.setState({ ...this.state, dmMessage: message });
  };

  openUpload = (val) => {
    this.setState({ ...this.state, showUploadModal: val });
  };

  doToggleClientDisplay = (val) => {
    this.setState({ ...this.state, showClients: val });
  };

  doToggleTrainingDisplay = (val) => {
    this.setState({ ...this.state, showTrainings: val });
  };

  updateUserData = async (newUserData, updateSig = false) => {
    if (!updateSig) {
      delete newUserData.signature; // messes up cookie storage
      const current = new Date();
      const nextYear = new Date();
      nextYear.setFullYear(current.getFullYear() + 1);
      await cookies.set("userObj", JSON.stringify(newUserData), {
        expires: nextYear,
      });
    }
    this.setState({ ...this.state, userObj: newUserData });
  };

  setBackButtonBlock = () => {
    window.onbeforeunload = function () {
      return "Your work will be lost.";
    };
  };

  render() {
    this.setBackButtonBlock();
    if (this.state.loggedIn) {
      return (
        <FormCountContext.Provider value={this.state.formCountState}>
          <div className='App container' id='mainContainer'>
            <BSNavBar
              logOut={this.logOut}
              toggleDisplay={this.toggleDisplay}
              isLoggedIn={this.state.loggedIn}
              userObj={this.state.userObj}
              appState={this.state}
            ></BSNavBar>
            {this.state.doDisplay !== "Reports" ? (
              <div id='desktopView' className='row'>
                <div className='col-sm-3'>
                  <DisplayExtra
                    name={this.state.doDisplay}
                    userObj={this.state.userObj}
                    scrollTop={this.scrollTop}
                    toggleDisplay={this.toggleDisplay}
                    appState={this.state}
                    setDmToUser={this.setDmToUser}
                    sendDM={this.sendDM}
                    dmMessage={this.state.dmMessage}
                    setDmMessage={this.setDmMessage}
                    showUploadModal={this.showUploadModal}
                    openUpload={this.openUpload}
                    doToggleClientDisplay={this.doToggleClientDisplay}
                    doToggleTrainingDisplay={this.doToggleTrainingDisplay}
                    showClients={this.state.showClients}
                    showTrainings={this.state.showTrainings}
                    loadMessage={this.loadMessage}
                  />
                </div>
                <div className='col-sm-9' id='actionSection'>
                  <div>
                    <ToggleScreen
                      name={this.state.doDisplay}
                      appState={this.state}
                      appendMessage={this.appendMessage}
                      toggleDisplay={this.toggleDisplay}
                      showClients={this.state.showClients}
                      showTrainings={this.state.showTrainings}
                      doToggleClientDisplay={this.doToggleClientDisplay}
                      doToggleTrainingDisplay={this.doToggleTrainingDisplay}
                      discussionMessagesLoading={
                        this.state.discussionMessagesLoading
                      }
                      removeMessage={this.removeMessage}
                      setDMs={this.setDMs}
                      updateUserData={this.updateUserData}
                      getAllUsers={this.getAllUsers}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div id='desktopView' className='row'>
                <div
                  className='col-md-12'
                  style={
                    this.state.doDisplay === "Reports"
                      ? { marginBottom: "150px 0px" }
                      : hideStyle
                  }
                >
                  <Reports
                    userObj={this.state.userObj}
                    allUsers={this.state.allUsers}
                  />
                </div>
              </div>
            )}
            <div
              className='hide-on-print'
              style={{ position: "fixed", left: "90vw", top: "85vh" }}
            >
              <button
                className='btn btn-light extraInfoButton'
                onClick={() => {
                  if (window.scrollY) window.scrollTo(0, 0);
                }}
              >
                <i className='fa fa-arrow-up'></i>
              </button>
            </div>
          </div>
        </FormCountContext.Provider>
      );
    } else {
      return (
        <div className='App'>
          <BSNavBar
            logOut={this.logOut}
            logIn={this.toggleLogIn}
            toggleDisplay={this.toggleDisplay}
            isLoggedIn={this.state.loggedIn}
            userObj={this.state.userObj}
          ></BSNavBar>
          <Header logIn={this.toggleLogIn} />
          {this.state.emailSent ? (
            <React.Fragment>
              <FormAlert
                doShow={this.state.emailSent}
                type='success'
                heading={`Thank you, We shall email you shortly`}
              ></FormAlert>
            </React.Fragment>
          ) : (
            <React.Fragment />
          )}
          <div className='container-fluid' id='greetingContainer'>
            <div className='row' id='greetingRow'>
              <div className='col-sm-7' id='greetingColRight'>
                <div id='greetingRowRight'>
                  <div id='greetingRowRightHeaderContainer'>
                    <h1 id='greetingRowRightHeader'>
                      Who we are and <br /> what we do
                    </h1>
                  </div>

                  <div id='greetingRowRightPContainer'>
                    <p id='greetingRowRightP'>
                      e-Care Residential aims to provide a simple, functional
                      software solution for both large and small scale behavior
                      residential care facilities. We are a young software
                      development company with experience in the fields of
                      software development and childcare. We offer a simple,
                      easy to use documenting and messaging software suite.
                    </p>
                  </div>
                  <div id='greetingRowRightBtnContainer'>
                    <button
                      onClick={this.toggleLearnMore}
                      className='btn darkBtn'
                    >
                      Request a Demo
                    </button>
                  </div>
                </div>
              </div>
              <div className='col-sm-5' id='iPhoneContainer'>
                <Fade bottom>
                  <div id='homeiPhone' />
                </Fade>
              </div>
            </div>
          </div>
          <Modal show={this.state.showLearnMore} onHide={this.toggleLearnMore}>
            <ModalHeader
              closeButton
              style={{
                color: "maroon",
                borderColor: "maroon",
                textAlign: "center",
                backgroundColor: "white",
              }}
            >
              <h5>Learn more about our services</h5>
            </ModalHeader>
            <ModalBody style={{ backgroundColor: "white" }}>
              <div className='form-group'>
                <p>
                  Complete the form below to get a personalized email describing
                  the services offered.
                </p>
                <input
                  id='name'
                  onChange={this.handleFieldInput}
                  value={this.state.name}
                  style={{ width: "100%", margin: "15px 0px" }}
                  className='form-control'
                  placeholder='Name'
                />
                <input
                  id='organization'
                  onChange={this.handleFieldInput}
                  value={this.state.organization}
                  style={{ width: "100%", margin: "15px 0px" }}
                  className='form-control'
                  placeholder='Organization'
                />
                <input
                  id='emailTo'
                  onChange={this.handleFieldInput}
                  value={this.state.emailTo}
                  style={{ width: "100%", margin: "15px 0px" }}
                  className='form-control'
                  placeholder='youremail@example.com'
                />
                <button
                  style={{
                    margin: "5px 0px",
                    float: "right",
                    backgroundColor: "maroon",
                    color: "white",
                  }}
                  onClick={this.sendEmail}
                  className='btn'
                >
                  Submit
                </button>
              </div>
            </ModalBody>
          </Modal>
        </div>
      );
    }
  }
}

function ToggleScreen({
  name,
  appState,
  appendMessage,
  toggleDisplay,
  showClients,
  showTrainings,
  doToggleClientDisplay,
  doToggleTrainingDisplay,
  discussionMessagesLoading,
  removeMessage,
  setDMs,
  updateUserData,
  getAllUsers,
}) {
  if (name === "Dashboard") {
    return (
      <div>
        <MessageBoard
          discussionMessagesLoading={discussionMessagesLoading}
          messages={appState.discussionMessages}
          appendMessage={appendMessage}
          toggleDisplay={toggleDisplay}
          userObj={appState.userObj}
          removeMessage={removeMessage}
        />
      </div>
    );
  }

  if (name === "AwakeNightStaffSignoff") {
    return (
      <div>
        <AwakeNightStaffSignoff
          valuesSet={false}
          userObj={appState.userObj}
          id='AwakeNightStaffSignoff'
        />
      </div>
    );
  }

  if (name === "Orientation Training") {
    return (
      <div>
        <OrientationTraining
          userObj={appState.userObj}
          allUsers={appState.allUsers}
        />
      </div>
    );
  }

  if (name === "Pre Service Training") {
    return (
      <div>
        <PreServiceTraining
          userObj={appState.userObj}
          allUsers={appState.allUsers}
        />
      </div>
    );
  }

  if (name === "Night Monitoring") {
    return (
      <div>
        <NightMonitoring
          valuesSet={false}
          userObj={appState.userObj}
          id='AwakeNightStaffSignoff'
        />
      </div>
    );
  }

  if (name === "First aid CPR Training") {
    return (
      <div>
        <FirstAidCprTraining
          userObj={appState.userObj}
          allUsers={appState.allUsers}
        />
      </div>
    );
  }

  if (name === "Documents") {
    return (
      <div>
        <Documents userObj={appState.userObj} allUsers={appState.allUsers} />
      </div>
    );
  }

  if (name === "User Management") {
    return (
      <div>
        <UserManagement
          userObj={appState.userObj}
          allUsers={appState.allUsers}
          updateUserData={updateUserData}
          getAllUsers={getAllUsers}
        />
      </div>
    );
  }

  if (name === "manTraining") {
    return (
      <div>
        <ManageTraining
          doToggleTrainingDisplay={doToggleTrainingDisplay}
          showTrainingsForm={showTrainings}
          userObj={appState.userObj}
        />
      </div>
    );
  }

  if (name === "TreatmentPlan72") {
    return (
      <div>
        <TreatmentPlan72
          valuesSet={false}
          userObj={appState.userObj}
          id='treatment'
        />
      </div>
    );
  }

  if (name === "IncidentReport") {
    return (
      <div>
        <IncidentReport
          valuesSet={false}
          userObj={appState.userObj}
          id='incident'
        />
      </div>
    );
  }

  if (name === "SeriousIncidentReport") {
    return (
      <div>
        <SeriousIncidentReport
          valuesSet={false}
          userObj={appState.userObj}
          id='incident'
        />
      </div>
    );
  }

  if (name === "admissionAssessment") {
    return (
      <div>
        <AdmissionAssessment
          valuesSet={false}
          userObj={appState.userObj}
          id='admissionAssessment'
        />
      </div>
    );
  }

  if (name === "Annual Training") {
    return (
      <div>
        <AnnualTraining
          valuesSet={false}
          userObj={appState.userObj}
          id='admissionAssessment'
        />
      </div>
    );
  }

  if (name === "bodyCheck") {
    return (
      <div>
        <BodyCheck
          valuesSet={false}
          userObj={appState.userObj}
          id='admissionAssessment'
        />
      </div>
    );
  }

  if (name === "DailyProgress") {
    return (
      <div>
        <DailyProgress
          valuesSet={false}
          userObj={appState.userObj}
          id='dailyProgress'
        />
      </div>
    );
  }

  if (name === "IllnessInjury") {
    return (
      <div>
        <IllnessInjury
          valuesSet={false}
          userObj={appState.userObj}
          id='illnessInjury'
        />
      </div>
    );
  }

  if (name === "restraintReport") {
    return (
      <div>
        <RestraintReport
          valuesSet={false}
          userObj={appState.userObj}
          id='restraintReport'
        />
      </div>
    );
  }

  if (name === "Manage Account") {
    return (
      <div>
        <ManageAccountContainer
          userObj={appState.userObj}
          updateUserData={updateUserData}
        />
      </div>
    );
  }

  if (name === "Clients") {
    return (
      <div>
        <Clients
          doToggleClientDisplay={doToggleClientDisplay}
          showClientForm={showClients}
          userObj={appState.userObj}
        />
      </div>
    );
  }

  if (name === "Direct Message") {
    return (
      <div>
        <DirectMessageBoard
          userObj={appState.userObj}
          messagesInit={appState.messages}
          allUsers={appState.allUsers}
          setDMs={setDMs}
        />
      </div>
    );
  }
}

function DisplayExtra({
  name,
  userObj,
  scrollTop,
  appState,
  setDmToUser,
  sendDM,
  dmMessage,
  setDmMessage,
  doToggleClientDisplay,
  doToggleTrainingDisplay,
  showClients,
  showTrainings,
  loadMessage,
}) {
  if (name === "TreatmentPlan72") {
    return (
      <div id='extraInfo'>
        <div className='extraInfoNavDiv'>
          <p className='extraInfoNavSubTitle'>
            This is what the must be filled out when a child is first admitted
            to the facility.
          </p>
          <p className='extraInfoNavSubTitle'>
            Required fields include, Child Name, Child DOA, Child Date of Birth,
            and thing like that.
          </p>
        </div>
      </div>
    );
  }

  if (name === "Orientation Training") {
    return (
      <div id='extraInfo'>
        <div className='extraInfoNavDiv'>
          <p className='extraInfoNavSubTitle'>
            New Employee Orientation training is an eight-hour (8) program
            provided to each new employee within the first fourteen days of
            hiring. The program includes, but is not limited to, the following
            employee and agency information.
          </p>
        </div>
      </div>
    );
  }

  if (name === "Pre Service Training") {
    return (
      <div id='extraInfo'>
        <div className='extraInfoNavDiv'>
          <p className='extraInfoNavSubTitle'>
            Pre-service training is a forty (40) hour course offered by New
            Pathways training staff at the facility within the first fourteen
            days of hiring. The program includes all the necessary topics to
            receive sole supervision status.
          </p>
        </div>
      </div>
    );
  }

  if (name === "First aid CPR Training") {
    return (
      <div id='extraInfo'>
        <div className='extraInfoNavDiv'>
          <p className='extraInfoNavSubTitle'>
            First Aid and CPR training is a course offered by a CPR/First Aid
            certified instructor or at the American Red Cross within the first
            ninety days of hiring.
          </p>
        </div>
      </div>
    );
  }

  if (name === "Documents") {
    return (
      <div id='extraInfo'>
        <div className='extraInfoNavDiv'>
          <p className='extraInfoNavSubTitle'>
            <i>This is where you upload documents for everyone to see</i>
          </p>
        </div>
        <div className='extraInfoButtonDiv'></div>
      </div>
    );
  }

  if (name === "restraintReport") {
    return (
      <div id='extraInfo'>
        <div className='extraInfoNavDiv'>
          <p className='extraInfoNavSubTitle'>
            If a child had to be restrained, file this form, notationg what
            happened to cause this action.
          </p>
        </div>
      </div>
    );
  }

  if (name === "admissionAssessment") {
    return (
      <div id='extraInfo'>
        <div className='extraInfoNavDiv'>
          <p className='extraInfoNavSubTitle'>Admission Assessment</p>
        </div>
      </div>
    );
  }

  if (name === "Annual Training") {
    return (
      <div id='extraInfo'>
        <div className='extraInfoNavDiv'>
          <p className='extraInfoNavSubTitle'>Annual Training</p>
        </div>
      </div>
    );
  }

  if (name === "bodyCheck") {
    return (
      <div id='extraInfo'>
        <div className='extraInfoNavDiv'>
          <p className='extraInfoNavSubTitle'>
            Indicate on the body diagram, all marks such as old or recent scars,
            bruises, discolorations or disfigurements and any other questionable
            or abnormal markings.
          </p>

          <p>
            1=Bruise 2=Abrasion 3=Scratch(es) 4=Scar 5=Scab 6=Rash 7=Cut(s)
            8=Sore 9=Birth Mark 10=Insect Bite(s)
          </p>
          <div
            style={{
              height: "550px",
              overflow: "scroll",
              borderColor: "#eee",
              borderRadius: 9,
              borderStyle: "solid",
            }}
          >
            <div className='d-flex justify-content-center'>
              <img src={leftBody} width={250} />
            </div>
            <div className='d-flex justify-content-center'>
              <img src={rightBody} width={250} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (name === "DailyProgress") {
    return (
      <div id='extraInfo'>
        <div className='extraInfoNavDiv'>
          <p className='extraInfoNavSubTitle'>
            This explains what the child has done today or what the child will
            do today.
          </p>
        </div>
      </div>
    );
  }

  if (name === "IllnessInjury") {
    return (
      <div id='extraInfo'>
        <div className='extraInfoNavDiv'>
          <p className='extraInfoNavSubTitle'>
            Illness and Injury Report Extra info
          </p>
        </div>
      </div>
    );
  }

  if (name === "IncidentReport") {
    return (
      <div id='extraInfo'>
        <div className='extraInfoNavDiv'>
          <p className='extraInfoNavSubTitle'>
            When an incident happens, this must be filled out in order to keep
            track of what exactly happend.
          </p>
        </div>
      </div>
    );
  }

  if (name === "SeriousIncidentReport") {
    return (
      <div id='extraInfo'>
        <div className='extraInfoNavDiv'>
          <p className='extraInfoNavSubTitle'>
            When a serious incident happens, this must be filled out in order to
            keep track of what exactly happend.
          </p>
        </div>
      </div>
    );
  }

  if (name === "Dashboard") {
    return (
      <div id='extraInfo'>
        <div id=''>
          <h4 className='extraInfoMainTitle'>
            {userObj.firstName + " " + userObj.lastName}
          </h4>
          <h6 className='extraInfoSubTitle'>
            {userObj.jobTitle.replace(/\//gm, " ")}
          </h6>
        </div>
        <div className='extraInfoNavDiv'>
          <p className='extraInfoNavSubTitle'>
            <i>
              This is the first screen users will see when they log in. I feel
              this is alright for now.
            </i>
          </p>
        </div>
        <div className='extraInfoButtonDiv'>
          <button
            onClick={() => {
              scrollTop();
              loadMessage(userObj);
            }}
            className='btn btn-light extraInfoButton m-1'
          >
            <i className='fa fa-refresh'></i> Refresh Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (name === "Manage Account") {
    return (
      <div id='extraInfo'>
        <div className='extraInfoNavDiv'>
          <p className='extraInfoNavSubTitle'>
            Allows users to view account information and update their password.
          </p>
        </div>
      </div>
    );
  }

  if (name === "Clients") {
    return (
      <div id='extraInfo'>
        <div className='extraInfoNavDiv'></div>
        <div className='extraInfoButtonDiv'>
          {showClients ? (
            <button
              onClick={() => {
                doToggleClientDisplay(false);
              }}
              className='btn btn-light extraInfoButton'
            >
              Add New Client
            </button>
          ) : (
            <button
              onClick={() => {
                doToggleClientDisplay(true);
              }}
              className='btn btn-light extraInfoButton'
            >
              Show All Clients
            </button>
          )}
        </div>
      </div>
    );
  }

  if (name === "manTraining") {
    return (
      <div id='extraInfo'>
        <div className='extraInfoNavDiv'></div>
        <div className='extraInfoButtonDiv'>
          {showTrainings ? (
            <p>Please select a training to begin editing.</p>
          ) : (
            <button
              onClick={() => {
                doToggleTrainingDisplay(true);
              }}
              className='btn btn-light extraInfoButton'
            >
              Show All Trainings
            </button>
          )}
        </div>
      </div>
    );
  }

  if (name === "Direct Message") {
    return (
      <div id='extraInfo'>
        <div className='extraInfoNavDiv'>
          <p className='extraInfoNavSubTitle'>
            Select a users and type your message
          </p>
          <div>
            <div style={{ width: "100%", display: "flex", margin: "10px 0px" }}>
              <p
                className='extraInfoNavSubTitle'
                style={{
                  width: "30px",
                  marginTop: "2px",
                }}
              >
                To:
              </p>
              <select
                style={{
                  flex: "1",
                  height: "30px",
                }}
                onChange={(e) => {
                  setDmToUser(e.target.value);
                }}
                defaultValue={appState.dmTo ? appState.dmTo : null}
              >
                <option selected value={null}>
                  Choose...
                </option>
                {appState.allUsers
                  .filter((user) => {
                    return user._id !== userObj._id;
                  })
                  .map((user) => {
                    return (
                      <option
                        key={user._id}
                        value={user._id}
                      >{`${user.firstName} ${user.lastName}`}</option>
                    );
                  })}
              </select>
            </div>
            <div style={{ width: "100%", margin: "10px 0px" }}>
              <textarea
                id='messageText'
                value={dmMessage}
                onChange={(e) => {
                  setDmMessage(e.target.value);
                }}
                cols='1'
                style={{
                  height: "150px",
                  width: "100%",
                  flex: "1",
                  borderColor: "#eee",
                  margin: "0px 5px",
                  resize: "none",
                  borderRight: "none",
                  borderTop: "none",
                  borderLeft: "none",
                }}
                placeholder='Type your message here..'
              ></textarea>
              <div style={{ height: 30, width: "100%", margin: "0px 5px" }}>
                {appState.showMessageSent && (
                  <p
                    style={{
                      color: "green",
                      background: "#00800038",
                      textAlign: "center",
                      borderRadius: 5,
                    }}
                  >
                    message sent
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  if (appState.dmMessage.length > 0 && appState.dmTo) sendDM();
                }}
                className='btn btn-light'
                style={{ margin: "0px 5px", width: "100%" }}
              >
                Send <i className='fas fa-paper-plane'></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (name === "User Management") {
    return (
      <div id='extraInfo'>
        <div className='extraInfoNavDiv'>
          <p className='extraInfoNavSubTitle'>
            Allows Admin users the ability to view information about their home
            as well create new and modify exiting staff members.
          </p>
        </div>
      </div>
    );
  } else {
    return <React.Fragment />;
  }
}

export default App;
