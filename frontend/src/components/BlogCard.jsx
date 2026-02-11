import React, { Component } from "react";
import { Card, CardText, CardBody, CardTitle, Button } from "reactstrap";
import { withRouter } from "react-router-dom"; // Keeps the navigation magic

class BlogCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // 1. HARDCODED REMOTE IMAGES (Guaranteed to load)
      blogImages: [
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80", // Code
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80", // Coding
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80", // Tech
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80"  // Cybersecurity
      ]
    };
  }

  // 2. DIRECT NAVIGATION FUNCTION
  // We receive the ID directly, no event or data-attribute needed.
  handleReadMore = (id) => {
    console.log("Read More Clicked for ID:", id); // DEBUG LOG
    if (id) {
      this.props.history.push(`/blog/${id}`);
    } else {
      console.error("Error: Cannot navigate, Blog ID is missing!");
    }
  };

  render() {
    const { blog } = this.props;

    // A. SAFE ID EXTRACTION (FastAPI vs Old)
    // We check both 'id' and 'blogID'
    const safeId = blog.id || blog.blogID;

    // B. SAFE CONTENT
    const rawContent = blog.content || blog.body || "No content available.";
    const safeContent = rawContent.substring(0, 100) + "...";

    // C. DETERMINISTIC IMAGE SELECTION
    // We use the ID to pick an image (ID 5 always gets Image 1, etc.)
    // If ID is missing, we default to Image 0
    const imageIndex = safeId ? safeId % this.state.blogImages.length : 0;
    const selectedImage = this.state.blogImages[imageIndex];

    return (
      <Card className="h-100 shadow-sm" style={{ border: "none", marginBottom: "20px" }}>
        
        {/* Image Section */}
        <div style={{ height: "200px", overflow: "hidden", borderRadius: "5px 5px 0 0" }}>
            <img 
                width="100%" 
                src={selectedImage} 
                alt={blog.title} 
                style={{ objectFit: "cover", height: "100%" }}
            />
        </div>

        <CardBody className="d-flex flex-column">
          <CardTitle tag="h5" style={{ fontWeight: "bold" }}>
            {blog.title}
          </CardTitle>
          
          <CardText style={{ color: "#555", flexGrow: 1 }}>
            {safeContent}
          </CardText>
          
          {/* D. BUTTON WITH DIRECT ARROW FUNCTION */}
          {/* This is the key fix. We pass safeId directly to the function. */}
          <Button 
            color="dark" 
            onClick={() => this.handleReadMore(safeId)}
            style={{ marginTop: "auto", alignSelf: "flex-start" }}
          >
            Read More
          </Button>
        </CardBody>
      </Card>
    );
  }
}

export default withRouter(BlogCard);