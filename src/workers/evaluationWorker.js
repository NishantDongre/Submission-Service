const { Worker } = require('bullmq');
const redisConnection = require('../config/redisConfig');
const axios = require('axios');
const SubmissionRepository = require("../repositories/submissionRepository");
const serverConfig = require('../config/serverConfig');


function evaluationWorker(queue) {
    new Worker('EvaluationQueue', async job => {
        if (job.name === 'EvaluationJob') {
            try {
                const submissionRepository = new SubmissionRepository();
                if (job.data.submissionId) {
                    // console.log("[evaluationWorker.js] Updating the Submission Status");
                    const updatedSubmission = await submissionRepository.updateSubmission(job.data);
                    // console.log("[evaluationWorker.js] Updated the Submission Status", updatedSubmission);
                }
                // console.log(updatedSubmission);
                const response = await axios.post(`${serverConfig.SOCKET_SERVICE_HOSTNAME}/sendCodeSubmissionResponsePayload`, {
                    userId: job.data.userId,
                    problemId: job.data.problemId,
                    payload: job.data
                })
                // console.log("[evaluationWorker.js] Socket-Server Response from /sendCodeSubmissionResponsePayload End Point", response);
            } catch (error) {
                console.log("[evaluationWorker.js] Error: ", error)
            }
        }
    }, {
        connection: redisConnection
    });
}

module.exports = evaluationWorker;

