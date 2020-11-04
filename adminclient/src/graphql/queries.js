/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getSurveyResponse = /* GraphQL */ `
  query GetSurveyResponse($id: ID!) {
    getSurveyResponse(id: $id) {
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
export const listSurveyResponses = /* GraphQL */ `
  query ListSurveyResponses(
    $filter: ModelSurveyResponseFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSurveyResponses(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
    }
  }
`;
