import Review from "../models/review.model.js";

const addReview = async (req, res) => {
  try {
    const { product_id, user_id, rating, parent, text, img_url, video_url } = req.body;


    const newReview = new Review({
      product_id,
      user_id,
      rating,
      parent,
      text,
      img_url,
      video_url,
    });


    await newReview.save();


    res.status(201).json({
      id: newReview._id,
      product_id: newReview.product_id,
      user_id: newReview.user_id,
      rating: newReview.rating,
      parent: newReview.parent,
      text: newReview.text,
      createdAt: newReview.createdAt,
      img_url: newReview.img_url,
      video_url: newReview.video_url,
    });
  } catch (error) {
    console.error("Error in review add controller: ", error.message);
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};


const getReviewsByProductId = async (req, res) => {
  try {
    const { product_id } = req.body;

    const reviews = await Review.find({ product_id })
      .populate("user_id") 
      .sort({ createdAt: -1 }); 

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews: ", error.message);
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};

export { addReview, getReviewsByProductId };
