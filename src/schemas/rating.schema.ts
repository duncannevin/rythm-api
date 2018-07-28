import * as mongoose from 'mongoose';
import { Rating } from '../models/rating';

export type RatingType = mongoose.Document & Rating;

const RatingSchema = new mongoose.Schema({
  todo_id: {
    type: String,
    required: true,
    unique: true
  },
  thumbs: {
    type: Number,
    required: true,
    default: 0
  },
  raters: [{
    user_id: String,
    timesRated: Number
  }]
});

type RatingType = Rating & mongoose.Document;
const RatingRepository = mongoose.model<RatingType>('Ratings', RatingSchema);
export default RatingRepository;