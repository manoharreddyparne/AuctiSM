import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button, Container, Row, Col } from "react-bootstrap";
import queryString from "query-string"; // Import query-string to parse the query params

const Error404Page = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search); // Parse the query parameters from the URL
  const searchQuery = queryParams.search; // Extract the search parameter

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <Row className="text-center">
        <Col>
          <h1 className="display-1 text-warning">404</h1>
          <h2 className="mb-3">Page Not Found</h2>
          <p className="lead text-muted">
            Sorry, the page you are looking for does not exist or has been moved.
          </p>

          {searchQuery && (
            <p className="text-muted">
              We couldn't find any results for: <strong>{searchQuery}</strong>
            </p>
          )}

          <Link to="/" className="d-inline-block mt-3">
            <Button variant="primary" size="lg">
              Go Back to Home
            </Button>
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default Error404Page;
