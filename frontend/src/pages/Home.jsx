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
    if (!Cookies.get("jwt")) {
      this.props.history.push("/login");
      return;
    }
    store.dispatch(usersActionCreator(userActionTypes.AUTHORIZED));
  };

  render() {
    // 1. SAFE DATA: Default to empty array if undefined
    const blogList = this.props.blogs || [];
    console.log("Home Page Blogs:", blogList);

    if (Cookies.get("isLoggedIn") === "false" && !this.props.isLoggedIn) {
      this.props.history.push("/login");
      return null;
    }

    return (
      <div>
        <Navbar />
        
        {this.state.loading ? (
           <div style={{ padding: "20px" }}>Loading...</div>
        ) : (
          <div className="container" style={{ marginTop: "50px" }}>
            
            {/* 2. EMPTY STATE MSG */}
            {blogList.length === 0 && (
                <div className="alert alert-info">
                    No blogs found. Go to "Create Blog" to add one!
                </div>
            )}

            {/* 3. GRID SYSTEM */}
            <Row>
                {blogList.map((blog) => (
                    // FIX: Use 'id' (FastAPI) instead of 'blogID'
                    <Col md={4} sm={6} xs={12} key={blog.id || Math.random()} className="mb-4">
                        <BlogCard blog={blog} />
                    </Col>
                ))}
            </Row>
          </div>
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