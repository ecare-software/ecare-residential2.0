import React, { Component } from "react";
import Axios from "axios";
//components
import Header from "./components/Header/Header";
import LogInContiner from "./components/LogInContainer/LogInContainer";
import Testimonial from "./components/Testimonial/Testimonial.js";
import Navbar from "./components/NavBar/Navbar.js";
//styles
import "./App.css";
import Fade from "react-reveal/Fade";
//modals

//const classes
const hideStyle = {
  display: "none"
};

const navNotSelected = {
  color: "#8000008a",
  padding: "0px 10px",
  fontFamily: "'Google Sans Display', Arial, Helvetica, sans-serif"
};

const navSelected = {
  backgroundColor: "rgb(128, 0, 0)",
  color: "white",
  borderRadius: "9px",
  padding: "0px 10px",
  fontFamily: "'Google Sans Display', Arial, Helvetica, sans-serif"
};

class App extends Component {
  state = {
    loggedIn: false,
    userObj: {
      // email: "demarcuskennedy95@gmail.com",
      // firstName: "DeMarcus",
      // homeId: "home-1234",
      // isAdmin: true,
      // jobTitle: "Admin",
      // lastLogIn: "2019-08-26T03:22:28.424Z",
      // lastName: "Kennedy",
      // newUser: true,
      // password: "xyz123",
      // __v: 0,
      // _id: "5d63507799ac0b1494149479"
    },
    messagesInitLoad: false,
    allUsersSet: false,
    errorModalMeta: {
      title: "",
      message: ""
    },
    doDisplay: "Dashboard",
    discussionMessages: []
  };

  componentDidUpdate = () => {
    if (!this.state.allUsersSet) {
      console.log(this.state)
      this.getAllUsers();
    }

    // if(!this.state.messagesInitLoad){
    //   this.loadMessage();
    // }
  };

  // loadMessage = () => {
  //   let curthis = this;
  //   Axios.get("/api/discussionMessages")
  //   .then(function(response) {
  //     curthis.setState({discussionMessages:response.data,messagesInitLoad:true});
  //     console.log(curthis.state.discussionMessages);
  //   })
  //   .catch(function(error) {
  //     console.log(error);
  //   });
  // };

  // appendMessage = message => {
  //   let curthis = this;
  //   let newMessage = {
  //     message: message,
  //     firstName: this.state.userObj.firstName,
  //     middleName: this.state.userObj.middleName,
  //     lastName: this.state.userObj.lastName,
  //     id: this.state.userObj._id,
  //     date: new Date().toISOString()
  //   };

  //   Axios.post("/api/discussionMessages", newMessage)
  //     .then(function(response) {
  //       curthis.state.discussionMessages.unshift(newMessage);
  //       let discussionMessagesTmp = curthis.state.discussionMessages;
  //       curthis.setState({discussionMessages:discussionMessagesTmp});
  //     })
  //     .catch(function(error) {
  //       console.log(error);
  //     });
  // };

  showErrorModal = (title, message) => {
    this.setState({ message: message });
    this.setState({ title: title });
    // document.getElementById("errorModalBtn").click();
  };

  getAllUsers = () => {
    Axios.get("/api/users/" + this.state.userObj.homeId).then(allUsers => {
      this.setState({ allUsers: allUsers.data, allUsersSet: true });
    });
  };

  logOut = () => {
    this.setState({ loggedIn: false });
    this.setState({ userObj: {} });
    this.setState({ doDisplay: "Dashboard" });
  };

  toggleLogIn = userObj => {
      if(this.state.loggedIn){
        document.body.classList.remove("modal-open");
        this.setState({ userObj: userObj,loggedIn: !this.state.loggedIn,message:"",title:"" });
      }else{
        if (userObj.newUser) {
          this.setState({ userObj: userObj,loggedIn: !this.state.loggedIn,message:"You need to reset your password. Click the Manage Profile button to do so.",title:"Welcome to RCS, Heres some information" });
          // document.getElementById("errorModalBtn").click();
        }
      }
  };



  // toggleDisplay = display => {
  //   if (document.getElementsByClassName("slidingDiv")[1].style.left === "0%") {
  //     document.getElementsByClassName("slidingDiv")[1].style.left = "-66%";
  //   } else {
  //     document.getElementsByClassName("slidingDiv")[1].style.left = "0%";
  //   }
  //   this.setState({ doDisplay: display });
  // };

  render() {
    if (this.state.loggedIn) {
      return (
        <div className="App" id="mainContainer">
          <Navbar doDisplay={this.state.doDisplay} />
        </div>
      );
    } else {
      return (
        <div className="App">
          <Header logIn={this.toggleLogIn} />
          <LogInContiner id="desktopLogin" logIn={this.toggleLogIn} />
          {/* Body Start */}
          <div className="container-fluid" id="greetingContainer">
            <div className="row" id="greetingRow">
              <div className="col-sm-7" id="greetingColRight">
                <div id="greetingRowRight">
                  <div id="greetingRowRightHeaderContainer">
                    <h1 id="greetingRowRightHeader">
                      Who we are and <br /> what we do
                    </h1>
                  </div>

                  <div id="greetingRowRightPContainer">
                    <p id="greetingRowRightP">
                      Health care, health-care, or healthcare is the maintenance
                      or improvement of health via the prevention, diagnosis,
                      and treatment of disease, illness, injury, and other
                      physical and mental impairments in people. Health care is
                      delivered by health professionals in allied health fields.
                    </p>
                  </div>
                  <div id="greetingRowRightBtnContainer">
                    <button className="btn darkBtn">Request a Demo</button>
                  </div>
                </div>
              </div>
              <div className="col-sm-5" id="iPhoneContainer">
                <Fade bottom>
                  <div id="homeiPhone" />
                </Fade>
              </div>
            </div>
          </div>
          <div style={{ paddingBottom: "100px" }}>
            <Testimonial dir="right" />
            <Testimonial dir="left" />
            <Testimonial dir="right" />
          </div>
          {/* Body End */}
        </div>
      );
    }
  }
}

export default App;
