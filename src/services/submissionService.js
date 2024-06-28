const SubmissionProducer = require("../producers/submissionQueueProducer");
class SubmissionService {
    constructor(submissionRepository) {
        this.submissionRepository = submissionRepository;
    }

    async pingCheck() {
        return "pong";
    }

    async addSubmission(submissionPayload) {
        // Save the submitted code in DB
        const submission = await this.submissionRepository.createSubmission(
            submissionPayload
        );

        if (!submission) {
            throw { messgae: "Not able to create submission" };
        }
        const response = await SubmissionProducer(submission);
        return { queueResponse: response, submission };
    }
}

module.exports = SubmissionService;
