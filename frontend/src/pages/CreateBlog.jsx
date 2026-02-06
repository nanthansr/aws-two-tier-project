import React, { Component } from "react";
import Cookies from "js-cookie";
import Navigation from "../components/Navbar";
import { endpoint } from "../endpoints"; 

export default class CreateBlog extends Component {
  constructor() {
    super();
    this.state = {
      title: "",
      content: "", // CHANGED: Matches Swagger "content"
      error: "",
    };
  }

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  createBlog = async (event) => {
    event.preventDefault();
    
    const token = Cookies.get("jwt");
    if (!token) {
      this.setState({ error: "You are not logged in!" });
      return;
    }

    // AUTO-GENERATE SLUG: "My First Blog" -> "my-first-blog"
    const generatedSlug = this.state.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const blogData = {
      title: this.state.title,
      content: this.state.content, // CHANGED: Matches Swagger
      slug: generatedSlug          // ADDED: Matches Swagger
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(blogData)
      });

      if (response.ok) {
        this.props.history.push("/"); 
      } else {
        const err = await response.json();
        this.setState({ error: err.detail || "Failed to create blog" });
      }
    } catch (error) {
      console.error("Network error:", error);
      this.setState({ error: "Could not connect to server" });
    }
  };

  render() {
    return (
      <div>
        <Navigation />
        <div className="form-container" style={{ marginTop: "50px", padding: "20px" }}>
          <h1>Create a New Blog</h1>
          
          {this.state.error && <p style={{ color: "red" }}>{this.state.error}</p>}

          <form onSubmit={this.createBlog}>
            
            {/* Title */}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", fontWeight: "bold" }}>Title:</label>
              <input
                type="text"
                name="title"
                value={this.state.title}
                onChange={this.handleChange}
                required
                style={{ width: "100%", padding: "8px" }}
              />
            </div>

            {/* Content - CHANGED NAME to 'content' */}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", fontWeight: "bold" }}>Content:</label>
              <textarea
                name="content"  
                value={this.state.content}
                onChange={this.handleChange}
                required
                rows="5"
                style={{ width: "100%", padding: "8px" }}
              />
            </div>

            <button 
              type="submit" 
              style={{ padding: "10px 20px", background: "black", color: "white", cursor: "pointer" }}
            >
              Publish Blog
            </button>
          </form>
        </div>
      </div>
    );
  }
}