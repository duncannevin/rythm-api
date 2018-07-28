import RatingRepository, { RatingType } from '../schemas/rating.schema';
import { TodoId, UserId } from 'general-types.ts';
import { Todo } from '../models/todo';
import { Rating } from '../models/rating';

class RatingService {
  /**
   * @description changes numbers of thumbs by set amount
   * @param {UserId} rater_id
   * @param {TodoId} todo_id
   * @param {Number} amount (negative or positive
   * @return {Promise<Rating>}
   */
  async incrementThumbs(rater_id: UserId, todo_id: TodoId, amount: Number): Promise<Rating> {
    return (await RatingRepository.findOneAndUpdate({todo_id: todo_id}, {$inc: {thumbs: amount}, $push: {user_id: rater_id, timesRated: 10}}, {new: true, upsert: true}));
  }

  /**
   * @description gets ratings for Todo
   * @param {TodoId} todo_id
   * @return {Promise<Rating>}
   */
  async getRating(todo_id: TodoId): Promise<Rating> {
    return await RatingRepository.findOne({todo_id: todo_id});
  }
}

export default new RatingService();