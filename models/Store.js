const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a store name'
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: 'You must include coordinates'
    }],
    address: {
      type: String,
      required: 'You must include an address'
    }
  },
  photo: String,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must include an author'
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Define our indexes
storeSchema.index({
  name: 'text',
  description: 'text'
});

storeSchema.index({ location: '2dsphere' });

storeSchema.pre('save', async function(next) {
  if(!this.isModified('name')){
    //skip it
    next();
    //stop this function from running
    return;
  }
  this.slug = slug(this.name);
  // if store has the same name make it unique
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const storesWithSlug = await this.constructor.find({ slug: slugRegEx });
  if(storesWithSlug.length) {
    this.slug =`${this.slug}-${storesWithSlug.length + 1}`
  }
  next();
  //TODO make sure no slugs have the same name
});

storeSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: '$tags' },
    { $group: {_id: '$tags', count: { $sum: 1 } }},
    { $sort: { count: -1 } }
  ]);
}

storeSchema.statics.getTopStores = function() {
  return this.aggregate([
    // 1. Lookup stores and populate their reviews
    { $lookup: {
        from: 'reviews',
        localField: '_id', 
        foreignField: 'store',
        as: 'reviews' 
      } 
    },
    // 2. Filter for only items that have 2 or more reviews
    { $match: { 'reviews.1': { $exists: true } }},
    // 3. Add the average reviews field
    { $project: {
        photo: '$$ROOT.photo',
        name: '$$ROOT.name',
        reviews: '$$ROOT.reviews',
        slug: '$$ROOT.slug',
        averageRating: { $avg: '$reviews.rating' }
      }
    },
    // 4. Sort it by our reviews field, the highest rating first
    { $sort: { averageRating: -1 } }, 
    // 5. Limit to the top 10
    { $limit: 10 }
  ]);
}

// Find reviews where the stores_id property === review store property
storeSchema.virtual('reviews', {
  // what model to link?
  ref: 'Review',
  // which field on the store?
  localField: '_id',
  // which field on the review?
  foreignField: 'store'
})

function autopopulate(next) {
  this.populate('reviews');
  next();
}

storeSchema.pre('find', autopopulate);
storeSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Store', storeSchema);