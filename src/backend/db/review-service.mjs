import Review from '../schema/review.mjs';
import errorThrower from '../helpers/error-thrower.mjs';
import ReviewState from '../schema/review-state-enum.mjs';
import ArticleVersion from '../schema/article-version.mjs';
import articleVersionService from './article-version-service.mjs';
import ARTICLE_VERSION_STATE from '../schema/article-version-state-enum.mjs';
import {getIds} from '../helpers/get-array-of-ids.mjs';
import {getReviewersInvitationTemplate} from '../email/templates/EmailTemplates.mjs';
import {sendEmailByEthereumAddress} from '../email/index.mjs';

export default {
  getAllReviews: () => {
    return Review.find({}).populate({
      path: 'articleVersion',
      populate: [
        {path: 'articleSubmission'},
        {path: 'editorApprovedReviews'},
        {path: 'communityReviews'}
      ]
    });
  },

  getReviewsFromArticle: articleVersion => {
    return Review.find({articleVersion}).populate({
      path: 'articleVersion',
      populate: [
        {path: 'articleSubmission'},
        {path: 'editorApprovedReviews'},
        {path: 'communityReviews'}
      ]
    });
  },

  getReviewInvitations: async address => {
    return await Review.find({
      reviewerAddress: address,
      reviewState: {$in: ['INVITED', 'SIGNED_UP_FOR_REVIEWING']}
    }).populate({
      path: 'articleVersion',
      populate: [
        {path: 'articleSubmission'},
        {path: 'editorApprovedReviews'},
        {path: 'communityReviews'}
      ]
    });
  },

  getMyReviews: address => {
    return Review.find({
      reviewerAddress: address,
      reviewState: {
        $in: ['HANDED_IN_DB', 'HANDED_IN_SC', 'DECLINED', 'ACCEPTED']
      }
    })
      .populate({
        path: 'articleVersion',
        populate: [
          {path: 'articleSubmission'},
          {path: 'editorApprovedReviews'},
          {path: 'communityReviews'}
        ]
      })
      .sort({stateTimestamp: -1});
  },

  getReviewsByState: async reviewState => {
    if (!(reviewState in ReviewState))
      errorThrower.notCorrectStatus('any of Object ReviewState', reviewState);

    return await Review.find({
      reviewState: {$in: [reviewState]}
    });
  },

  getReviewsByStateAndUser: async (reviewerAddress, reviewState) => {
    if (!(reviewState in ReviewState))
      errorThrower.notCorrectStatus('any of Object ReviewState', reviewState);

    return await Review.find({
      reviewerAddress,
      reviewState: {$in: [reviewState]}
    }).sort({stateTimestamp: -1});
  },

  getHandedInReviews: async () => {
    return await Review.find({
      reviewState: {$in: ['HANDED_IN_SC']}
    }).populate({
      path: 'articleVersion',
      populate: [
        {path: 'articleSubmission'},
        {path: 'editorApprovedReviews'},
        {path: 'communityReviews'}
      ]
    });
  },

  getHandedInReviewsAssignedTo: async ethereumAddress => {
    let articles = await articleVersionService.getArticlesAssignedTo(
      ethereumAddress,
      [ARTICLE_VERSION_STATE.OPEN_FOR_ALL_REVIEWERS]
    );
    const articleIds = getIds(articles);

    return await Review.find({
      reviewState: {$in: ['HANDED_IN_SC']},
      articleVersion: {$in: articleIds}
    }).populate({
      path: 'articleVersion',
      populate: [
        {path: 'articleSubmission'},
        {path: 'editorApprovedReviews'},
        {path: 'communityReviews'}
      ]
    });
  },

  getArticlesWithEnoughAcceptedReviews: async (
    reviewType,
    minNumberOfReviews
  ) => {
    return await Review.aggregate([
      {
        $match: {
          reviewState: 'ACCEPTED',
          reviewType: reviewType
        }
      },
      {$group: {_id: '$articleVersion', count: {$sum: 1}}},
      {$match: {count: {$gte: minNumberOfReviews}}}
    ]);
  },

  getReviewById: async (userAddress, reviewId) => {
    return await Review.findById(reviewId).populate({
      path: 'articleVersion',
      populate: [
        {path: 'articleSubmission'},
        {path: 'editorApprovedReviews'},
        {path: 'communityReviews'}
      ]
    });
  },

  getReview: async (reviewerAddress, articleVersionId) => {
    return await Review.findOne({
      reviewerAddress,
      articleVersion: articleVersionId
    }).populate({
      path: 'articleVersion',
      populate: [
        {path: 'articleSubmission'},
        {path: 'editorApprovedReviews'},
        {path: 'communityReviews'}
      ]
    });
  },

  getReviewByReviewHash: async reviewHash => {
    const review = await Review.findOne({reviewHash: reviewHash});
    if (!review) errorThrower.noEntryFoundByParameters('reviewHash');
    return review;
  },

  getArticleVersionIds: idObjects => {
    return idObjects.map(i => {
      return i.articleVersion;
    });
  },

  createReviewInvitation: async (reviewerAddress, articleHash, reviewType) => {
    let articleVersion = await ArticleVersion.findOne({
      articleHash
    });
    if (!articleVersion) errorThrower.noEntryFoundById(articleHash);

    let review = await Review.findOne({
      reviewerAddress,
      articleVersion: articleVersion._id
    });

    if (review) {
      review.stateTimestamp = new Date();
      review.reviewType = reviewType;
    } else {
      review = new Review({
        reviewState: ReviewState.INVITED,
        stateTimestamp: new Date(),
        reviewerAddress,
        articleVersion: articleVersion._id,
        reviewType
      });
    }
    review.save();

    sendEmailByEthereumAddress({
      ethereumAddress: reviewerAddress,
      from: 'info@eurekatoken.io',
      subject: 'Reviewer Invitation',
      html: getReviewersInvitationTemplate(articleVersion)
    });
  },

  signUpForReviewing: async (reviewerAddress, articleHash, reviewType, stateTimeStamp) => {
    let articleVersion = await ArticleVersion.findOne({
      articleHash
    });
    if (!articleVersion) errorThrower.noEntryFoundById(articleHash);

    let review = await Review.findOne({
      reviewerAddress,
      articleVersion: articleVersion._id
    });

    if (review) {
      review.reviewType = reviewType;
      review.reviewState = ReviewState.SIGNED_UP_FOR_REVIEWING;
      review.stateTimestamp = stateTimeStamp;
    } else {
      review = new Review({
        reviewState: ReviewState.SIGNED_UP_FOR_REVIEWING,
        stateTimestamp: stateTimeStamp,
        reviewerAddress,
        articleVersion: articleVersion._id,
        reviewType
      });
    }
    return review.save();
  },

  /**
   * Frontend sends the data of an review right
   * before he submits the editorApprovedReviews hash into the SC
   * @param userAddress
   * @param reviewId
   * @param reviewText
   * @param reviewHash
   * @param score1
   * @param score2
   * @param articleHasMajorIssues
   * @param articleHasMinorIssues
   * @returns {Promise<string>}
   */
  addEditorApprovedReview: async (
    userAddress,
    reviewId,
    reviewText,
    reviewHash,
    score1,
    score2,
    articleHasMajorIssues,
    articleHasMinorIssues
  ) => {
    const review = await Review.findById(reviewId);
    if (!review) errorThrower.noEntryFoundById(reviewId);
    if (review.reviewerAddress !== userAddress)
      errorThrower.notCorrectEthereumAddress();
    if (
      review.reviewState !== ReviewState.INVITED &&
      review.reviewState !== ReviewState.SIGNED_UP_FOR_REVIEWING
    ) {
      errorThrower.notCorrectStatus(
        [ReviewState.INVITED, ReviewState.SIGNED_UP_FOR_REVIEWING],
        review.reviewState
      );
    }

    review.reviewHash = reviewHash;
    review.reviewText = reviewText;
    review.reviewScore1 = score1;
    review.reviewScore2 = score2;
    review.articleHasMajorIssues = articleHasMajorIssues;
    review.articleHasMinorIssues = articleHasMinorIssues;
    review.reviewState = ReviewState.HANDED_IN_DB;
    await review.save();
    return 'Added editor-approved review into DB.';
  },

  updateReview: async (
    userAddress,
    reviewId,
    reviewText,
    reviewHash,
    score1,
    score2,
    articleHasMajorIssues,
    articleHasMinorIssues
  ) => {
    const review = await Review.findById(reviewId);
    if (!review) errorThrower.noEntryFoundById(reviewId);
    if (review.reviewerAddress !== userAddress)
      errorThrower.notCorrectEthereumAddress();
    if (review.reviewState !== ReviewState.HANDED_IN_DB) {
      errorThrower.notCorrectStatus(
        [ReviewState.HANDED_IN_DB],
        review.reviewState
      );
    }

    review.reviewHash = reviewHash;
    review.reviewText = reviewText;
    review.reviewScore1 = score1;
    review.reviewScore2 = score2;
    review.articleHasMajorIssues = articleHasMajorIssues;
    review.articleHasMinorIssues = articleHasMinorIssues;
    review.reviewState = ReviewState.HANDED_IN_DB;
    await review.save();
    return 'saved editor-approved review to DB.';
  },

  updateEditorApprovedReviewFromSC: async (
    articleHash,
    reviewHash,
    reviewerAddress,
    stateTimestamp,
    articleHasMajorIssues,
    articleHasMinorIssues,
    score1,
    score2
  ) => {
    let articleVersion = await ArticleVersion.findOne({
      articleHash: articleHash
    });

    let review = await Review.findOne({
      articleVersion: articleVersion._id,
      reviewHash: reviewHash,
      reviewerAddress: reviewerAddress
    });
    if (!review) errorThrower.noEntryFoundById(reviewHash);
    review.reviewState = ReviewState.HANDED_IN_SC;
    review.stateTimestamp = stateTimestamp;
    // web3 event listener returns false as null
    review.articleHasMajorIssues = !!articleHasMajorIssues;
    review.articleHasMinorIssues = !!articleHasMinorIssues;
    review.reviewScore1 = score1;
    review.reviewScore2 = score2;
    await review.save();
    return 'Updated editor-approved review according to SC: ' + reviewHash;
  },

  updateReviewByReviewHash: async (
    oldReviewHash,
    newReviewHash,
    stateTimestamp,
    articleHasMajorIssues,
    articleHasMinorIssues,
    score1,
    score2
  ) => {
    let review = await Review.findOne({
      reviewHash: oldReviewHash
    });
    if (!review) errorThrower.noEntryFoundByParameters('oldReviewHash');

    review.reviewHash = newReviewHash;
    review.stateTimestamp = stateTimestamp;
    review.articleHasMajorIssues = articleHasMajorIssues;
    review.articleHasMinorIssues = articleHasMinorIssues;
    review.reviewScore1 = score1;
    review.reviewScore2 = score2;
    await review.save();
    return 'Updated review with ID: ' + review._id;
  },

  /**
   * Frontend sends the data of an review right
   * before he submits the communityReviews hash into the SC
   * @param userAddress
   * @param reviewId
   * @param reviewText
   * @param reviewHash
   * @param score1
   * @param score2
   * @param articleHasMajorIssues
   * @param articleHasMinorIssues
   * @returns {Promise<void>}
   */
  addNewCommunityReview: async (
    userAddress,
    articleHash,
    reviewText,
    reviewHash,
    score1,
    score2,
    articleHasMajorIssues,
    articleHasMinorIssues
  ) => {
    let articleVersion = await ArticleVersion.findOne({
      articleHash: articleHash
    });
    if (!articleVersion) errorThrower.noEntryFoundById(articleHash);

    const review = new Review({
      reviewerAddress: userAddress,
      reviewText: reviewText,
      reviewHash: reviewHash,
      reviewScore1: score1,
      reviewScore2: score2,
      articleHasMajorIssues: articleHasMajorIssues,
      articleHasMinorIssues: articleHasMinorIssues,
      reviewState: ReviewState.HANDED_IN_DB,
      stateTimestamp: new Date().getTime(),
      articleVersion: articleVersion._id
    });
    await review.save();
    articleVersion.communityReviews.push(review._id);
    await articleVersion.save();
    return review;
  },
  updateCommunityReviewFromSC: async (
    articleHash,
    reviewHash,
    reviewerAddress,
    stateTimestamp,
    articleHasMajorIssues,
    articleHasMinorIssues,
    score1,
    score2
  ) => {
    let articleVersion = await ArticleVersion.findOne({
      articleHash: articleHash
    });

    let review = await Review.findOne({
      articleVersion: articleVersion._id,
      reviewHash: reviewHash,
      reviewerAddress: reviewerAddress
    });

    if (!review) errorThrower.noEntryFoundById(reviewHash);
    review.reviewState = ReviewState.HANDED_IN_SC;
    review.stateTimestamp = stateTimestamp;
    // web3 event listener returns false as null
    review.articleHasMajorIssues = !!articleHasMajorIssues;
    review.articleHasMinorIssues = !!articleHasMinorIssues;
    review.reviewScore1 = score1;
    review.reviewScore2 = score2;
    await review.save();
    return 'Updated community review according to SC: ' + reviewHash;
  },

  acceptReview: async (articleHash, reviewerAddress, stateTimestamp) => {
    const articleVersion = await ArticleVersion.findOne({
      articleHash: articleHash
    });

    let review = await Review.findOne({
      articleVersion: articleVersion._id,
      reviewerAddress
    });

    review.reviewState = ReviewState.ACCEPTED;
    review.stateTimestamp = stateTimestamp;
    await review.save();
    return 'Acception of review ' + review._id;
  },

  declineReview: async (articleHash, reviewerAddress, stateTimestamp) => {
    const articleVersion = await ArticleVersion.findOne({
      articleHash: articleHash
    });

    let review = await Review.findOne({
      articleVersion: articleVersion._id,
      reviewerAddress
    });

    review.reviewState = ReviewState.DECLINED;
    review.stateTimestamp = stateTimestamp;
    await review.save();
    return 'Decline of review ' + review._id;
  },

  resignReview: async (_reviewerAddress, _articleVersionId) => {
    let review = await  Review.findOne({
      reviewerAddress: _reviewerAddress,
      articleVersion: _articleVersionId
    });


    review.reviewState = ReviewState.NOT_EXISTING;
    review.stateTimestamp = 0;
    review.reviewer = '0x0';
    //review.isEditorApprovedReview = false;
    await review.save();
    return 'Resigning of the review ' + review._id;
  }
};
