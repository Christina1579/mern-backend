const dotenv = require("dotenv");
const express = require("express");
const fs = require("fs");
const connectToDatabase = require("./database/index.js");
const Book = require("./Model/bookmodel.js");
const { multer, storage } = require("./middleware/multerConfig");
const upload = multer({ storage: storage });
const cors = require("cors");

dotenv.config();
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json()); // for parsing application/json
const mongoose = require("mongoose");
connectToDatabase();
app.get("/", (req, res) => {
  res.status(400).json({ message: "how are u" });
});

// create book
app.post("/book", upload.single("image"), async (req, res) => {
  let fileName;
  if (!req.file) {
    fileName =
      "https://www.google.com/url?sa=i&url=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FImage&psig=AOvVaw36kwqosDkIMIFAIr7cYv2e&ust=1753354718880000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCPjR3rvp0o4DFQAAAAAdAAAAABAE";
  } else {
    fileName = "http://localhost:3000/" + req.file.filename;
  }

  const {
    bookName,
    bookPrice,
    isbnNumber,
    authorName,
    publishedAt,
    publication,
    description,
  } = req.body;
  try {
    await Book.create({
      bookName,
      bookPrice,
      isbnNumber,
      authorName,
      publishedAt,
      publication,
      description,
      imageUrl: fileName,
    });
  } catch (error) {
    console.log(error.message);
  }
  res.status(201).json({
    message: "Book Created Successfully",
  });
});

// all read
app.get("/book", async (req, res) => {
  const books = await Book.find(); // return array ma garxa
  res.status(200).json({
    message: "Books fetched successfully",
    data: books,
  });
});

// single read
app.get("/book/:id", async (req, res) => {
  const id = req.params.id;
  const book = await Book.findById(id); // return object garxa

  if (!book) {
    res.status(404).json({
      message: "Nothing found",
    });
  } else {
    res.status(200).json({
      message: "Single Book Fetched Successfully",
      data: book,
    });
  }
});

// delete operation  
app.delete("/book/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const book = await Book.findById(id);

        if (!book) {
            return res.status(404).json({
                message: "Book not found",
            });
        }

        // Delete image file only if it's stored locally (not external link)
        if (book.imageUrl && book.imageUrl.startsWith("http://localhost:3000/")) {
            const localHostUrlLength = "http://localhost:3000/".length;
            const imagePath = book.imageUrl.slice(localHostUrlLength);

            fs.unlink(`storage/${imagePath}`, (err) => {
                if (err) {
                    console.error("Error deleting file:", err);
                } else {
                    console.log("Image file deleted successfully");
                }
            });
        }

        // Delete book from DB
        await Book.findByIdAndDelete(id);

        res.status(200).json({
            message: "Book Deleted Successfully",
        });

    } catch (error) {
        console.error("Error deleting book:", error);
        res.status(500).json({
            message: "Something went wrong",
        });
    }
});

// update operation
app.patch("/book/:id", upload.single("image"), async (req, res) => {
  const id = req.params.id; // kun book update garney id ho yo
  const {
    bookName,
    bookPrice,
    authorName,
    publishedAt,
    publication,
    description,
    isbnNumber,
  } = req.body;
  const olddatas = await Book.findById(id);
  let fileName;
  if (req.file) {
    const oldImagePath = olddatas.imageUrl;
    console.log(oldImagePath);
    const localHostUrlLength = "http://localhost:3000/".length;
    const newOldImagePath = oldImagePath.slice(localHostUrlLength);

    fs.unlink(`storage/${newOldImagePath}`, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("File deleted succesfully");
      }
    });
    fileName = "http://localhost:3000/" + req.file.filename;
    //console.log(req.file)
    // console.log(olddatas)
  }
  await Book.findByIdAndUpdate(id, {
    bookName: bookName,
    bookPrice: bookPrice,
    authorName: authorName,
    publication: publication,
    publishedAt: publishedAt,
    isbnNumber: isbnNumber,
    description: description,
  });
  res.status(200).json({
    message: "Book Updated Successfully",
  });
});
app.use(express.static("./Storage"));

app.listen(process.env.PORT, () => {
  console.log(`Nodejs Server is running on port ${process.env.PORT}`);
});
