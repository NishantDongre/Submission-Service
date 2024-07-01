const SubmissionCreationError = require("../errors/submissionCreation.error");
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
            throw new SubmissionCreationError(
                "Failed to create a submission in the repository"
            );
        }
        const response = await SubmissionProducer(submission);
        return { queueResponse: response, submission };
    }
}

module.exports = SubmissionService;
