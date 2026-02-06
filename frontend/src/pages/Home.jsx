import React, { Component } from "react";
import Cookies from "js-cookie";
import { Row, Col } from "reactstrap";
import { connect } from "react-redux";

// components
import BlogCard from "../components/BlogCard";
import Navbar from "../components/Navbar";

// redux
import store from "../redux/store/store";
import { userActionTypes } from "../redux/constants/usersAction.types";
import usersActionCreator from "../redux/actions/usersAction.creator";

class Home extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
    };
  }

  componentDidMount = () => {
    // 1. Auth Check
    if (
      typeof Cookies.get("isLoggedIn") === "undefined" &&
      typeof Cookies.get("jwt") === "undefined"
    ) {
      this.props.history.push("/login");
      return;
    }
    // 2. Fetch Data
    store.dispatch(usersActionCreator(userActionTypes.AUTHORIZED));
  };

  render() {
    // DEBUGGER: This will tell us if Redux has the data
    console.log("Home Page Blogs Data:", this.props.blogs); 

    if (Cookies.get("isLoggedIn") === "false" && !this.props.isLoggedIn) {
      this.props.history.push("/login");
      return null;
    }

    // Safety: Ensure blogs is an array
    const blogList = Array.isArray(this.props.blogs) ? this.props.blogs : [];

    return (
      <div>
        {this.state.loading ? (
          <>
            <Navbar />
            <div style={{ padding: "20px" }}>Loading Blogs...</div>
          </>
        ) : (
          <>
            <Navbar />
            <div className="body-container" style={{ padding: "20px" }}>
              {blogList.length === 0 && <p>No blogs found. Create one!</p>}
              
              {blogList.map((blog, index) => {
                // Grid Logic: Create a new Row every 4 items
                return index % 4 === 0 ? (
                  <Row key={index}>
                    {blogList.slice(index, index + 4).map((b) => {
                      return (
                        <Col className="py-2" key={b.id || b.blogID || Math.random()}>
                          {/* Pass the data to the card */}
                          <BlogCard blog={b} /> 
                        </Col>
                      );
                    })}
                  </Row>
                ) : null;
              })}
            </div>
          </>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.loginReducer.isLoggedIn,
    blogs: state.blogReducer.blogs,
  };
};

export default connect(mapStateToProps)(Home);