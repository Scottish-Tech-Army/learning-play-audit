/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createSurveyResponse = /* GraphQL */ `
  mutation CreateSurveyResponse(
    $input: CreateSurveyResponseInput!
    $condition: ModelSurveyResponseConditionInput
  ) {
    createSurveyResponse(input: $input, condition: $condition) {
      id
      surveyVersion
      surveyResponse
      photos {
        bucket
        description
        fullsize {
          key
          width
          height
        }
      }
      schoolName
      responderName
      responderEmail
      createdAt
      updatedAt
      owner
    }
  }
`;
export const updateSurveyResponse = /* GraphQL */ `
  mutation UpdateSurveyResponse(
    $input: UpdateSurveyResponseInput!
    $condition: ModelSurveyResponseConditionInput
  ) {
    updateSurveyResponse(input: $input, condition: $condition) {
      id
      surveyVersion
      surveyResponse
      photos {
        bucket
        description
        fullsize {
          key
          width
          height
        }
      }
      schoolName
      responderName
      responderEmail
      createdAt
      updatedAt
      owner
    }
  }
`;
export const deleteSurveyResponse = /* GraphQL */ `
  mutation DeleteSurveyResponse(
    $input: DeleteSurveyResponseInput!
    $condition: ModelSurveyResponseConditionInput
  ) {
    deleteSurveyResponse(input: $input, condition: $condition) {
      id
      surveyVersion
      surveyResponse
      photos {
        bucket
        description
        fullsize {
          key
          width
          height
        }
      }
      schoolName
      responderName
      responderEmail
      createdAt
      updatedAt
      owner
    }
  }
`;
