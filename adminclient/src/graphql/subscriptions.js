/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateSurveyResponse = /* GraphQL */ `
  subscription OnCreateSurveyResponse($owner: String) {
    onCreateSurveyResponse(owner: $owner) {
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
export const onUpdateSurveyResponse = /* GraphQL */ `
  subscription OnUpdateSurveyResponse($owner: String) {
    onUpdateSurveyResponse(owner: $owner) {
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
export const onDeleteSurveyResponse = /* GraphQL */ `
  subscription OnDeleteSurveyResponse($owner: String) {
    onDeleteSurveyResponse(owner: $owner) {
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
