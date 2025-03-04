import { useState } from "react";
import "./App.css";

const App = () => {
  // State Variables
  const [singleFile, setSingleFile] = useState(null);
  const [displayImage, setDisplayImage] = useState(null);
  const [displayImages, setDisplayImages] = useState([]);
  const [displayDogImage, setDisplayDogImage] = useState("");
  const [message, setMessage] = useState("");

  // Handle File Selection
  const handleSingleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSingleFile(e.target.files[0]);
    }
  };

  // Fetch a Random Single Image
  const fetchSingleFile = async () => {
    try {
      const response = await fetch(`http://localhost:8000/fetch/single`);
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setDisplayImage(imageUrl);
    } catch (error) {
      console.error("Error fetching single file:", error);
    }
  };

  // Upload a Single File
  const handleSubmitSingleFile = async (e) => {
    e.preventDefault();
    if (!singleFile) {
      setMessage("Please select a file before uploading.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", singleFile);

      const response = await fetch(`http://localhost:8000/save/single`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Image upload failed");
      }
      setMessage("File uploaded successfully!");
    } catch (error) {
      console.log("Error:", error);
    }
  };

  // Fetch Multiple Files
  const fetchMultipleFiles = async () => {
    try {
      const response = await fetch(`http://localhost:8000/fetch/multiple`);
      const data = await response.json();

      const filePromises = data.map(async (filename) => {
        const fileResponse = await fetch(
          `http://localhost:8000/fetch/file/${filename}`
        );
        const fileBlob = await fileResponse.blob();
        return URL.createObjectURL(fileBlob);
      });

      const imageUrls = await Promise.all(filePromises);
      setDisplayImages(imageUrls);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch a Random Dog Image
  const fetchDogImage = async () => {
    try {
      const response = await fetch(`https://dog.ceo/api/breeds/image/random`);
      const data = await response.json();
      setDisplayDogImage(data.message);
    } catch (error) {
      console.log("Error fetching dog image:", error);
    }
  };

  // Save the Dog Image
  const saveDogImage = async () => {
    if (!displayDogImage) {
      console.log("No dog image to save!");
      return;
    }

    try {
      const fileResponse = await fetch(displayDogImage);
      const blob = await fileResponse.blob();

      // Convert blob into a File object
      const file = new File([blob], "dog-image.jpg", { type: blob.type });

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`http://localhost:8000/save/single`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Upload Response:", data);
    } catch (error) {
      console.error("Error saving dog image:", error);
    }
  };

  return (
    <div>
      <p>{message}</p>

      {/* Fetch Single Image */}
      <h2>Fetch Single Random Image</h2>
      <button onClick={fetchSingleFile}>Fetch Single File</button>
      {displayImage && (
        <div>
          <h3>Single File</h3>
          <img
            src={displayImage}
            alt="Display"
            style={{ width: "200px", marginTop: "10px" }}
          />
        </div>
      )}

      {/* Upload Single File */}
      <form onSubmit={handleSubmitSingleFile}>
        <h2>Upload Single File</h2>
        <input type="file" onChange={handleSingleFileChange} />
        <button type="submit">Upload Single File</button>
      </form>

      {/* Fetch Multiple Files */}
      <button onClick={fetchMultipleFiles}>Fetch Multiple Files</button>
      {displayImages.length > 0 ? (
        displayImages.map((imageUrl, index) => (
          <div key={index}>
            <img src={imageUrl} alt="Multiple" style={{ width: "200px" }} />
          </div>
        ))
      ) : (
        <p>No images to display</p>
      )}

      {/* Fetch and Save Dog Image */}
      <button onClick={fetchDogImage}>Fetch Dog Image</button>
      {displayDogImage && (
        <div>
          <img src={displayDogImage} alt="Dog" style={{ width: "200px" }} />
          <br />
          <button onClick={saveDogImage}>Save it</button>
        </div>
      )}
    </div>
  );
};

export default App;
