import React, { Component } from "react";
import Cookies from "js-cookie";
import { detailEndpoint } from "../endpoints";
import Navigation from "../components/Navbar";
// If you have RelatedLinks, keep the import. If not, comment it out.
import RelatedLinks from "../components/RelatedLinks"; 

export default class BlogDetail extends Component {
  constructor() {
    super();
    this.state = {
      blog: null, // Start as null to distinguish "loading" from "empty"
      loading: true,
      error: ""
    };
  }

  fetchBlog = (id) => {
    // FIX 1: Ensure we have a token (optional, depending on your API)
    const token = Cookies.get("jwt");
    const headers = token ? { "Authorization": `Bearer ${token}` } : {};

    // FIX 2: Add the slash "/" to prevent ".../blogs1" error
    fetch(`${detailEndpoint}/${id}`, {
        method: "GET",
        headers: headers
    })
    .then((response) => {
        if (!response.ok) throw new Error("Blog not found");
        return response.json();
    })
    .then((data) => {
        this.setState({ blog: data, loading: false });
    })
    .catch((error) => {
        console.error("Error:", error);
        this.setState({ error: "Could not load blog", loading: false });
    });
  };

  componentDidMount = () => {
    this.fetchBlog(this.props.match.params.id);
  };

  componentDidUpdate = (prevProps) => {
    if (prevProps.match.params.id !== this.props.match.params.id) {
        this.fetchBlog(this.props.match.params.id);
    }
  };

  render() {
    const { blog, loading, error } = this.state;

    if (loading) return (
        <div><Navigation /><div className="container p-5">Loading...</div></div>
    );

    if (error || !blog) return (
        <div><Navigation /><div className="container p-5 text-danger">{error || "Blog not found"}</div></div>
    );

    // Default image if missing
    const imageUrl = blog.imageUrl || "https://images.unsplash.com/photo-1499750310159-525446cc0d27?auto=format&fit=crop&w=800&q=80";

    return (
      <div>
        <Navigation />
        <div className="container" style={{ marginTop: "50px" }}>
            <h1 className="display-4">{blog.title}</h1>
            
            <div style={{ width: "100%", height: "400px", overflow: "hidden", borderRadius: "10px", margin: "20px 0" }}>
                <img 
                    src={imageUrl} 
                    alt={blog.title} 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                />
            </div>
            
            <div className="content" style={{ fontSize: "1.2rem", lineHeight: "1.8" }}>
                {blog.content}
            </div>

            <hr />
            
            {/* FIX 3: Safety Check - Only render RelatedLinks if data exists */}
            {/* If RelatedLinks component exists, pass the data safely */}
             {blog.related_links && (
                <RelatedLinks blog={blog} />
             )}
        </div>
      </div>
    );
  }
}