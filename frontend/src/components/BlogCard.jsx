import React, { Component } from "react";
import { Card, CardText, CardBody, CardTitle, Button } from "reactstrap";
import { withRouter } from "react-router-dom";

class BlogCard extends Component {
  blogDetail = (event) => {
    // FIX: Use the 'data-id' attribute to safely get the ID
    const id = event.currentTarget.getAttribute("data-id");
    this.props.history.push(`/blog/${id}`);
  };

  render() {
    const blog = this.props.blog;
    
    // FIX: Handle missing fields safely
    // 1. Use 'id' (FastAPI standard) instead of 'blogID'
    // 2. Use a placeholder image if 'imageUrl' is missing
    const safeId = blog.id || blog.blogID;
    const safeImage = blog.imageUrl || "https://via.placeholder.com/300x200?text=No+Image"; 
    const safeContent = blog.content || "";

    return (
      <Card className="h-100" style={{ boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)" }}>
        {/* Image Section */}
        <div style={{ height: "200px", overflow: "hidden" }}>
            <img 
                width="100%" 
                src={safeImage} 
                alt={blog.title} 
                style={{ objectFit: "cover", height: "100%" }}
            />
        </div>

        <CardBody>
          <CardTitle tag="h5" style={{ fontWeight: "bold" }}>{blog.title}</CardTitle>
          <CardText>{safeContent.substring(0, 100)}...</CardText>
          
          {/* FIX: Pass ID via data attribute to avoid undefined errors */}
          <Button 
            color="dark" 
            onClick={this.blogDetail} 
            data-id={safeId}
          >
            Read More
          </Button>
        </CardBody>
      </Card>
    );
  }
}

export default withRouter(BlogCard);