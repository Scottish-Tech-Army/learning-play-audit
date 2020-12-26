# Learning Through Landscapes - Learning and Play Audit Survey



This monorepo contains the following projects:

- [cdk-backend](cdk-backend) - AWS CDK project to build required AWS components and deploy web applications.
- [surveyclient](surveyclient) - React (PWA) web application for completing the LTL audit surveys.
- [adminclient](adminclient) - React web application for review and retrieval of LTL audit survey responses.
- [sharedmodel](sharedmodel) - content common to surveyclient and adminclient - the survey questions and description.

To build and deploy this application, start with building [sharedmodel](sharedmodel), then build the two web
applications [adminclient](adminclient) and [surveyclient](surveyclient), finally build the AWS CDK project
[cdk-backend](cdk-backend), as described in each project.

Built by [Scottish Tech Army](https://www.scottishtecharmy.org/) volunteers.

This project is property of [Learning Through Landscapes](https://www.ltl.org.uk/). The project code is Open Source
licensed as described below, while the survey content (i.e. the questions and descriptions within the
survey) are Copyright 2020 Learning Through Landscapes.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this project except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
