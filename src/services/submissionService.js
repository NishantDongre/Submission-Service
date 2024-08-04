const { fetchProblemDetail } = require("../apis/problemAdminApi");
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
        const problemId = submissionPayload.problemId;

        const problemAdminApiResponse = await fetchProblemDetail(problemId);

        if (!problemAdminApiResponse) {
            throw SubmissionCreationError(
                "Failed to create a submission in the repository"
            );
        }

        const languageCodeStub = problemAdminApiResponse.data.codeStubs.find(
            (codeStub) =>
                codeStub.language.toLowerCase() ===
                submissionPayload.language.toLowerCase()
        );

        submissionPayload.code =
            languageCodeStub.startSnippet +
            "\n \n" +
            submissionPayload.code +
            "\n \n" +
            languageCodeStub.endSnippet;

        // Save the submitted code in DB
        const submission = await this.submissionRepository.createSubmission(
            submissionPayload
        );
        if (!submission) {
            throw new SubmissionCreationError(
                "Failed to create a submission in the repository"
            );
        }

        const response = await SubmissionProducer({
            [submission._id]: {
                code: submissionPayload.code,
                language: submissionPayload.language,
                inputCase: submissionPayload.customTestCaseInput,
                outputCase: problemAdminApiResponse.data.testCases[0].output,
            },
        });
        return { queueResponse: response, submission };
    }
}

module.exports = SubmissionService;
