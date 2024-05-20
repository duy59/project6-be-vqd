const express = require("express");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require('multer');

// Define storage for the uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null,uniqueSuffix + Date.now() + path.extname(file.originalname));
  }
});

// Create multer instance
const upload = multer({ storage: storage });

router.post("/", async (request, response) => {});

router.get("/images/:filename", (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, "../public/images", filename);
  res.sendFile(imagePath);
});

router.get("/photosOfUser/:id", async (req, res) => {
  const userId = req.params.id;

  // Check if userId is a valid ObjectId
  if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    // Find the user with the given ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find photos of the user with the given ID
    const photos = await Photo.find({ user_id: userId }).lean().exec();

    // Assemble the response data with minimum user information for comments
    const responseData = photos.map((photo) => {
      const comments = photo.comments.map((comment) => ({
        comment: comment.comment,
        date_time: comment.date_time,
        _id: comment._id,
        user_id: comment.user_id
      }));
      return {
        _id: photo._id,
        user_id: photo.user_id,
        file_name: photo.file_name,
        date_time: photo.date_time,
        comments: comments,
      };
    });

    res.json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/commentsOfPhoto/:photo_id",async (req, res) => {
  const { photo_id } = req.params;
  const { comment } = req.body;
  // Validate the comment
  if (!comment) {
    return res.status(400).json({ error: "Comment cannot be empty" });
  }
  console.log(req.body);
  try {
    const photo = await Photo.findById(photo_id);
    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }
    // Add the comment to the photo
    photo.comments.push({
      comment: comment,
      user_id: req.body.userId,
      date_time: new Date(),
    });
    // Save the updated photo
    const updatedPhoto = await photo.save();
    res.status(200).json(updatedPhoto);
  } catch (error) {
    console.error("Failed to add comment:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

router.post('/new', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.body.userId;
    const fileName = req.file.filename;
    // Create new Photo object and save it to the database
    const photo = new Photo({
      file_name: fileName,
      user_id: userId,
      date_time: new Date(),
    });

    await photo.save();

    res.status(200).json({ message: 'Photo uploaded successfully' });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});


module.exports = router;
