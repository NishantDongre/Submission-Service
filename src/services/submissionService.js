const { fetchProblemDetail } = require("../apis/problemAdminApi");
const SubmissionCreationError = require("../errors/submissionCreation.error");
const SubmissionProducer = require("../producers/submissionQueueProducer");
const serverConfig = require("../config/serverConfig");

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(serverConfig.GEMINI_API_KEY);
const axiosInstance = require("../config/axiosInstance");
const { default: axios } = require("axios");


class SubmissionService {
    constructor(submissionRepository) {
        this.submissionRepository = submissionRepository;
    }

    async pingCheck() {
        return "pong";
    }

    async addSubmission(submissionPayload) {
        const problemId = submissionPayload.problemId;
        const userId = submissionPayload.userId;
        const userCode = submissionPayload.code;
        const isCustomTestCase = submissionPayload.isCustomTestCase;

        const problemAdminApiResponse = await fetchProblemDetail(problemId);

        if (!problemAdminApiResponse) {
            throw new SubmissionCreationError(
                "Failed to create a submission in the repository"
            );
        }

        const languageCodeStub = problemAdminApiResponse.data.codeStubs.find(
            (codeStub) =>
                codeStub.language.toLowerCase() ===
                submissionPayload.language.toLowerCase()
        );

        const userCodeWithStartAndEndSnippet =
            languageCodeStub.startSnippet +
            "\n \n" +
            submissionPayload.code +
            "\n \n" +
            languageCodeStub.endSnippet;

        // If "Run Code" button is click on Client Side
        if (isCustomTestCase === true) {
            const testCases = submissionPayload.testCases;
            const customTestCaseStr = "CustomTestCase";
            const customTestCaseSubmissionPayload = {
                code: userCodeWithStartAndEndSnippet,
                language: submissionPayload.language,
                testCases,
                problemId,
                userId,
                submissionId: customTestCaseStr,
                isCustomTestCase: true,
                timeLimit: submissionPayload.language.toLowerCase() == 'java' ? 2 * problemAdminApiResponse.data.timeLimit : submissionPayload.language.toLowerCase() == 'python' ? 5 * problemAdminApiResponse.data.timeLimit : 1 * problemAdminApiResponse.data.timeLimit,
                actualCode: problemAdminApiResponse.data.actualCode, // Always C++ code
            };
            const response = await SubmissionProducer({
                [customTestCaseStr]: customTestCaseSubmissionPayload
            });
            return { queueResponse: response, customTestCaseSubmissionPayload };
        }


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
                code: userCodeWithStartAndEndSnippet,
                language: submissionPayload.language,
                testCases: problemAdminApiResponse.data.testCases,
                problemId,
                userId,
                submissionId: submission._id,
                isCustomTestCase: false,
                timeLimit: submissionPayload.language.toLowerCase() == 'java' ? 2 * problemAdminApiResponse.data.timeLimit : submissionPayload.language.toLowerCase() == 'python' ? 5 * problemAdminApiResponse.data.timeLimit : 1 * problemAdminApiResponse.data.timeLimit,
                actualCode: problemAdminApiResponse.data.actualCode, // Always C++ Code
            },
        });
        return { queueResponse: response, submission };
    }

    async updateSubmission(updatePayload) {
        const updatedSubmission = await this.submissionRepository.updateSubmission(
            updatePayload
        );
        return updatedSubmission;
    }

    async getAllSubmissionsByUserIdAndProblemId(payload) {
        const allsubmissions = await this.submissionRepository.getAllSubmissionsByUserIdAndProblemId(
            payload.userId, payload.problemId
        );
        return allsubmissions;
    }

    async getSubmissionById(submissionId) {
        const submission = await this.submissionRepository.getSubmissionById(submissionId);
        return submission;
    }

    getLlmPromptForTimeAndSpaceComplexity(problemDescription, userCode, driverCode){

    //     let prompt = `
    //     You are a code analysis assistant. Analyze the following data, which includes a problem description, 
    //     a user's solution (userCode), and a corresponding driver code (driverCode). 
    //     Your task is to provide the time complexity and space complexity of the user's solution in detail.
    //     `
    //     prompt += `\n \n`
    //     prompt += `problemDescription: --> ${problemDescription}`
    //     prompt += `\n \n`
    //     prompt += `userCode: --> ${userCode}`;
    //     prompt += `\n \n`
    //     prompt += `driverCode: --> ${driverCode}`;
    //     prompt += `\n \n`
      
      
    //     prompt += `Instructions for Analysis:
    //   - Contextualize: Understand the problem statement and constraints from the problemDescription.
    //   - Analyze: Focus on the userCode logic and assess the time complexity based on the loops, data structures, and operations used. Include factors such as input size (n) and any nested operations.
    //   - Memory Usage: Determine the space complexity, including space used for variables, data structures, and recursion (if applicable).
    //   - Only give the Time and Space Complexity if the userCode and not the driver code and don't mentioned userCode in your output
    //   - Output Format: Provide the result in the following format:
      
    //   Analysis
      
    //   Time Complexity: Explain the time complexity of the userCode in Big-O notation, providing reasoning based on the structure of the code.
      
    //   Space Complexity: Explain the space complexity of the userCode in Big-O notation, detailing the memory required for variables, auxiliary data structures, and recursion stacks (if any).
      
    //   Example Output: Below is the sample output which is expected form you
      
    //   Time Complexity:
    //   The time complexity is O(n), as the code iterates through the input array nums once while performing constant-time operations for each element.
      
    //   Space Complexity:
    //   The space complexity is O(n), due to the usage of an unordered_map to store up to n elements of the input array.
    //   `



    let prompt = `
You are a highly skilled code analysis assistant. Analyze the following input data, which includes a problemDescription, a userCode, and a driverCode. Your task is to evaluate the time complexity and space complexity of the userCode.

Instructions for Analysis:
- Understand the Problem Context:
    - Use the problemDescription to understand the constraints, input size, and requirements of the problem.

- Analyze Only the userCode:
    - Focus exclusively on the logic and structure of the userCode.
    - Do not consider the driverCode in your analysis or mention it in your output.

- Detailed Complexity Analysis:
    - Time Complexity: Assess the runtime efficiency of the userCode in Big-O notation.
        - Base your explanation on loops, recursion, nested operations, and the impact of input size (n).
    - Space Complexity: Determine the memory usage of the userCode in Big-O notation.
        - Include memory required for variables, data structures, and recursion stacks (if applicable).

Output Requirements:
- Do not refer to userCode or driverCode in the output.
- Use the following format for your response:

Output Format:
- Time Complexity:
    - Provide the time complexity in Big-O notation, with reasoning based on the operations in the userCode.

- Space Complexity:
    - Provide the space complexity in Big-O notation, detailing memory usage based on variables, data structures, and recursion.

Example Output:
- Time Complexity:
    The time complexity is O(n log n), as the code uses a sorting algorithm with a complexity of O(n log n) and a single traversal of the sorted array.

- Space Complexity:
    The space complexity is O(1), as the algorithm performs the operations in-place without requiring additional memory beyond the input array.

`
    prompt += `\n \n`
    prompt += `problemDescription: --> ${problemDescription}`
    prompt += `\n \n`
    prompt += `userCode: --> ${userCode}`;
    prompt += `\n \n`
    prompt += `driverCode: --> ${driverCode}`;
    prompt += `\n \n`
      
      return prompt;
      
      }

    getLlmPromptForCodeReview(problemDescription, userCode, driverCode){
    let prompt = `
You are a strict and precise code reviewer. Your task is to evaluate the userCode submitted for the given problemDescription and driverCode. Your response must only include two fields: "code" and "comments".

"code" Field:
- Return the userCode with comments inserted directly within the code at relevant lines to highlight errors, issues, or areas needing improvement.
- The comments in the userCode should:
    - Clearly point out mistakes, inefficiencies, or edge cases not handled.
    - Use concise and professional language for clarity.
- If the userCode is correct and adheres to best practices:
    - Add a comment at the top of the userCode explicitly acknowledging that it is correct and meets all guidelines.


"comments" Field:
- Provide a brief textual explanation of any identified issues or mistakes in the userCode.
- Mention why these issues are problematic and how they can be corrected.
- If the userCode is correct:
    - Explicitly state: “The submitted code is correct, solves the problem as required, and adheres to all best practices.”

Points to Remember:
- Focus Only on the userCode: Do not evaluate the problemDescription or driverCode.
- No Correct Code: Do not rewrite or provide the correct version of the userCode under any circumstances. Only add comments to the provided userCode.
- No Unnecessary Suggestions: Provide feedback only if there are mistakes, inefficiencies, or missing aspects. Avoid suggesting improvements unless they address actual issues.
- Explicit Acknowledgement: If the code is correct, clearly state so in both fields.

Input Provided to You:
problemDescription: Details of the problem to solve.
userCode: The code submitted by the user for review.
driverCode: Actual Code in C++ which is correct for the given problemDescription.
`
        prompt += `\n \n`
        prompt += `problemDescription: --> ${problemDescription}`
        prompt += `\n \n`
        prompt += `userCode: (This code is submitted by user)--> ${userCode}`;
        prompt += `\n \n`
        prompt += `driverCode: --> ${driverCode}`;
        prompt += `\n \n`
      
      return prompt;      
      }

    getCodeStub(language, problem) {
        const codeStub = problem.codeStubs.find(
          (item) => item.language.toLowerCase() === language
        );
        return codeStub.startSnippet + codeStub.userSnippet + codeStub.endSnippet;
    }

    async getSubmissionAnalyze(submissionId){
        try {
            const submission = await this.submissionRepository.getSubmissionById(submissionId);
            
            const response = await fetchProblemDetail(submission.problemId);
            const problem = response.data
            
            const codeStub = this.getCodeStub(submission.language, problem);

            const userCode = submission.code;
            const problemDescription = problem.description;
            const driverCode = codeStub;

            const llmPromptForTimeAndSpaceComplexity = this.getLlmPromptForTimeAndSpaceComplexity(problemDescription, userCode, driverCode);
 
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(llmPromptForTimeAndSpaceComplexity);
            // console.log(result.response.text());
            return result.response.text();
          } catch (error) {
            console.log(`[submissionService.js] Error in getSubmissionAnalyze(${submissionId})`,error)
        }

    }

    async getSubmissionReview(submissionId){
        const submission = await this.submissionRepository.getSubmissionById(submissionId);

        try {
            const submission = await this.submissionRepository.getSubmissionById(submissionId);
            
            const response = await fetchProblemDetail(submission.problemId);
            const problem = response.data
            
            const codeStub = this.getCodeStub(submission.language, problem);

            const userCode = submission.code;
            const problemDescription = problem.description;
            const driverCode = codeStub;

            const llmPromptForCodeReview = this.getLlmPromptForCodeReview(problemDescription, userCode, driverCode);
            

            const schema = {
                type: "OBJECT", 
                properties: {
                  comments: {
                    type: "STRING",
                    description: "Comments on the userCode"
                  },
                  code: {
                    type: "STRING",
                    description: "userCode with highlighted mistakes/issues"
                  }
                },
                required: ["comments", "code"]
              };
              
              const model = genAI.getGenerativeModel({
                model: "gemini-1.5-pro",
                generationConfig: {
                  responseMimeType: "application/json",
                  responseSchema: schema
                }
              });


            const result = await model.generateContent(llmPromptForCodeReview);
            const responseObject = JSON.parse(result.response.text());

            return responseObject;
        } catch (error) {
            console.log(`[submissionService.js] Error in getSubmissionReview(${submissionId})`,error)
        }
    }

}

module.exports = SubmissionService;
