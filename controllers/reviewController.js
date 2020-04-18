const mongoose = require('mongoose');
const Review = mongoose.model('Review');
// const Store = mongoose.model('Store');
// const User = mongoose.model('User');


exports.addReview = async (req, res) => {
  req.body.author = req.user._id;
  req.body.store = req.params.id;
  const newReview = new Review(req.body);
  await newReview.save();
  req.flash('success', 'Review saved');
  res.redirect('back');
}