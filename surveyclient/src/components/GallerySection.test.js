/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkPhotoSections"] }] */

import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act, Simulate } from "react-dom/test-utils";
import GallerySection from "./GallerySection";
import surveyStore from "../model/SurveyModel";
import { Provider } from "react-redux";
import { GALLERY } from "./FixedSectionTypes";
import { REFRESH_STATE } from "../model/ActionTypes";
import { INPUT_STATE, EMPTY_STATE } from "../model/TestUtils";

var storedSectionId = null;
function setSectionId(sectionId) {
  storedSectionId = sectionId;
}

const SECTIONS = [
  { id: "section1" },
  { id: "section2" },
  { id: GALLERY },
  { id: "section4" },
];

describe("component GallerySection", () => {
  var container = null;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);
    // Populate state and auth state
    surveyStore.dispatch({ type: REFRESH_STATE, state: INPUT_STATE });
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it("initial empty state", () => {
    surveyStore.dispatch({ type: REFRESH_STATE, state: EMPTY_STATE });
    renderComponent();

    expect(photoSections()).toHaveLength(0);
  });

  it("initial state with photos", () => {
    renderComponent();

    checkPhotoSections([
      {
        sectionId: "general",
        title: "General",
        photos: [
          { description: "test photo3", imageData: btoa("image data3") },
        ],
      },
      {
        sectionId: "wellbeing-colourful",
        title:
          "Wellbeing - Entrances and signs are colourful, bright, happy and welcoming.",
        photos: [
          { description: "test photo1", imageData: btoa("image data1") },
          { description: "test photo2", imageData: btoa("image data2") },
        ],
      },
    ]);
  });

  it("add photo", async () => {
    renderComponent();
    await addPhotoInput("new imageData4");

    checkPhotoSections([
      {
        sectionId: "general",
        title: "General",
        photos: [
          { description: "test photo3", imageData: btoa("image data3") },
          { description: "", imageData: btoa("new imageData4") },
        ],
      },
      {
        sectionId: "wellbeing-colourful",
        title:
          "Wellbeing - Entrances and signs are colourful, bright, happy and welcoming.",
        photos: [
          { description: "test photo1", imageData: btoa("image data1") },
          { description: "test photo2", imageData: btoa("image data2") },
        ],
      },
    ]);
  });

  it("add photo and click confirm", async () => {
    renderComponent();
    expect(confirmButton()).toBeNull();

    await addPhotoInput("new imageData3");
    expect(confirmButton()).not.toBeNull();
    click(confirmButton());
    renderComponent();

    expect(confirmButton()).toBeNull();
  });

  it("add photo and click backdrop", async () => {
    renderComponent();
    expect(confirmButton()).toBeNull();

    await addPhotoInput("new imageData3");
    expect(confirmButton()).not.toBeNull();
    click(confirmBackdrop());
    renderComponent();

    expect(confirmButton()).toBeNull();
  });

  it("add multiple photos", async () => {
    renderComponent();
    await addPhotoInput("new imageData4", "new imageData5");

    checkPhotoSections([
      {
        sectionId: "general",
        title: "General",
        photos: [
          { description: "test photo3", imageData: btoa("image data3") },
          { description: "", imageData: btoa("new imageData4") },
          { description: "", imageData: btoa("new imageData5") },
        ],
      },
      {
        sectionId: "wellbeing-colourful",
        title:
          "Wellbeing - Entrances and signs are colourful, bright, happy and welcoming.",
        photos: [
          { description: "test photo1", imageData: btoa("image data1") },
          { description: "test photo2", imageData: btoa("image data2") },
        ],
      },
    ]);
  });

  async function addPhotoInput(...fileData) {
    const files = fileData.map(
      (data) => new Blob([data], { type: "mimeType" })
    );
    // Create a fake target as JS really doesn't like creating FileLists arbitrarily
    const target = document.createElement("div");
    target.blur = jest.fn();
    target.files = files;

    Simulate.change(addPhotoButton(), { target: target });
    // Not a fan of sleeps, but indirect async waiting doesn't work
    await sleep(2000);
    renderComponent();
  }

  it("change photo description", async () => {
    renderComponent();

    setDescriptionOfFirstPhoto("new description");
    renderComponent();

    checkPhotoSections([
      {
        sectionId: "general",
        title: "General",
        photos: [
          { description: "new description", imageData: btoa("image data3") },
        ],
      },
      {
        sectionId: "wellbeing-colourful",
        title:
          "Wellbeing - Entrances and signs are colourful, bright, happy and welcoming.",
        photos: [
          { description: "test photo1", imageData: btoa("image data1") },
          { description: "test photo2", imageData: btoa("image data2") },
        ],
      },
    ]);
  });

  it("bottom navigation", () => {
    storedSectionId = null;
    renderComponent();

    click(previousButton());
    expect(storedSectionId).toStrictEqual("section2");

    click(nextButton());
    expect(storedSectionId).toStrictEqual("section4");
  });

  const descriptionField = () =>
    container.querySelector(".photo-container textarea");
  const addPhotoButton = () =>
    container.querySelector("#icon-button-add-photo");
  const photoSections = () => [
    ...container.querySelectorAll(".gallery-section-question"),
  ];
  const previousButton = () =>
    container.querySelector(".section .previous-section-button");
  const nextButton = () =>
    container.querySelector(".section .next-section-button");
  const confirmBackdrop = () =>
    document.querySelector("#confirm-dialog-container div:first-child");
  const confirmButton = () => document.querySelector(".dialog #ok-button");

  function setDescriptionOfFirstPhoto(value) {
    const element = descriptionField();
    element.value = value;
    Simulate.change(element);
  }

  function click(element) {
    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }

  function checkPhotoSections(expectedSections) {
    renderComponent();
    const sections = photoSections();
    expect(sections).toHaveLength(expectedSections.length);
    expectedSections.forEach((expectedSection, i) => {
      const section = sections[i];
      expect(section.getAttribute("id")).toStrictEqual(
        expectedSection.sectionId
      );
      expect(section.querySelector("h3").textContent).toStrictEqual(
        expectedSection.title
      );

      const expectedPhotos = expectedSection.photos;
      const photos = section.querySelectorAll(".photo-container");
      expect(photos).toHaveLength(expectedPhotos.length);
      expectedPhotos.forEach((expectedPhoto, p) => {
        const photo = photos[p];
        expect(photo.querySelector("textarea").textContent).toStrictEqual(
          expectedPhoto.description
        );
        expect(photo.querySelector("img").getAttribute("src")).toStrictEqual(
          "data:image/jpeg;base64," + expectedPhoto.imageData
        );
      });
    });
  }

  function renderComponent() {
    act(() => {
      render(
        <Provider store={surveyStore}>
          <GallerySection
            sections={SECTIONS}
            setCurrentSection={setSectionId}
          />
        </Provider>,
        container
      );
    });
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
});
