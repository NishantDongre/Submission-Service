const Submission = require("../models/submissionModel");

class SubmissionRepository {
    constructor() {
        this.submissionModel = Submission;
    }

    async createSubmission(submission) {
        const response = await this.submissionModel.create(submission);
        return response;
    }

    async updateSubmission(updatePayload) {
        const { isCE, isTLE, isRE, isWA } = updatePayload.responseSendToUser;
        let update;
        if (isCE) {
            update = { status: "CE" };
        } else if (isTLE) {
            update = { status: "TLE" };
        } else if (isRE) {
            update = { status: "RE" };
        } else if (isWA) {
            update = { status: "WA" };
        } else {
            update = { status: "SUCCESS" };
        }
        const response = await this.submissionModel.findByIdAndUpdate({ _id: updatePayload.submissionId }, update, { new: true });
        return response;
    }

    async getAllSubmissionsByUserIdAndProblemId(userId, problemId) {
        const response = await this.submissionModel.find({ userId: userId, problemId: problemId }).sort({ createdAt: -1 });
        return response;
    }


    async getSubmissionById(submissionId) {
        const response = await this.submissionModel.findById(submissionId);
        return response;
    }

}

module.exports = SubmissionRepository;
