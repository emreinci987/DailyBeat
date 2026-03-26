import Feedback from '../../models/Feedback.js';

/**
 * Business logic around song feedback.
 */

export async function submitFeedback(userId, feedbackData) {
    return Feedback.createFeedback({ userId, ...feedbackData });
}

export async function getUserFeedbacks(userId, options) {
    return Feedback.getFeedbacksByUser(userId, options);
}

export async function removeFeedback(feedbackId, userId) {
    const feedback = await Feedback.getFeedbackById(feedbackId);
    if (!feedback) return null;
    if (feedback.userId !== userId) {
        throw Object.assign(new Error('Bu geri bildirimi silme yetkiniz yok'), { status: 403, expose: true });
    }
    await Feedback.deleteFeedback(feedbackId);
    return feedback;
}

export default { submitFeedback, getUserFeedbacks, removeFeedback };
