import React from "react";
import { INTRODUCTION } from "./FixedSectionTypes";
import "../App.css";

function SectionBottomNavigation({
  sections,
  currentSectionId,
  setCurrentSectionId,
}) {
  function showSectionNavigation() {
    return currentSectionId !== INTRODUCTION;
  }

  function hasNextSection() {
    return (
      sections.findIndex((section) => section.id === currentSectionId) <
      sections.length - 1
    );
  }

  function hasPreviousSection() {
    return sections.findIndex((section) => section.id === currentSectionId) > 1;
  }

  const PREVIOUS_SECTION = 0;
  const NEXT_SECTION = 1;

  function changeSection(direction) {
    var index = sections.findIndex(
      (section) => section.id === currentSectionId
    );
    index += direction === PREVIOUS_SECTION ? -1 : 1;
    if (index >= 0 && index < sections.length) {
      setCurrentSectionId(sections[index].id);
    }
  }

  if (!showSectionNavigation()) {
    return null;
  }

  return (
    <div className="bottom-navigation">
      <button
        className={
          "previous-section-button" + (hasPreviousSection() ? "" : " hidden")
        }
        aria-label="previous section"
        disabled={!hasPreviousSection()}
        onClick={() => changeSection(PREVIOUS_SECTION)}
      >
        <svg width="150px" height="50px" viewBox="0 0 150 50">
          <title>previous section</title>
          <g
            id="Screens"
            stroke="none"
            strokeWidth="1"
            fill="none"
            fillRule="evenodd"
          >
            <g
              id="Survey/1.Background-Information---Complete"
              transform="translate(-743.000000, -788.000000)"
            >
              <g id="Group-16" transform="translate(743.000000, 788.000000)">
                <rect
                  id="Rectangle"
                  fill="#F6A85C"
                  x="0"
                  y="0"
                  width="150"
                  height="50"
                ></rect>
                <g
                  id="Group-11"
                  transform="translate(13.000000, 4.000000)"
                  fillRule="nonzero"
                >
                  <text
                    id="Previous-Section"
                    fill="#404040"
                    fontFamily="SpecialElite-Regular, Special Elite"
                    fontSize="14"
                    fontWeight="normal"
                  >
                    <tspan x="0.975585938" y="38">
                      Previous Section
                    </tspan>
                  </text>
                  <g id="chevron" transform="translate(58.000000, 0.000000)">
                    <path
                      d="M9.41596639,18.7044335 C9.51417506,18.8153509 9.56937683,18.9660188 9.56937683,19.1231527 C9.56937683,19.2802866 9.51417506,19.4309546 9.41596639,19.5418719 L9.20081136,19.7857143 C9.1029431,19.8970174 8.97000077,19.9595794 8.83135323,19.9595794 C8.69270569,19.9595794 8.55976336,19.8970174 8.4618951,19.7857143 L0.482034193,10.7389163 L0.195160823,10.4133005 C0.103648089,10.3098784 0.0495436573,10.1714289 0.0434656621,10.0251232 C0.0421611556,10.0105464 0.0421611556,9.99585752 0.0434656621,9.98128079 C0.0490730077,9.83461507 0.102871693,9.69562738 0.19429151,9.59162562 L0.48116488,9.26699507 L8.46319907,0.221674877 C8.56106733,0.110371713 8.69400966,0.047809713 8.8326572,0.047809713 C8.97130474,0.047809713 9.10424707,0.110371713 9.20211533,0.221674877 L9.41727036,0.465517241 C9.51547903,0.576434604 9.5706808,0.727102575 9.5706808,0.884236453 C9.5706808,1.04137033 9.51547903,1.1920383 9.41727036,1.30295567 L1.73862649,10.0029557 L9.41596639,18.7044335 Z"
                      id="Path"
                      fill="#404040"
                    ></path>
                    <path
                      d="M0.482034193,10.7389163 C0.456651008,10.7185164 0.432675561,10.6959553 0.41031585,10.6714286 L0.195160823,10.4275862 C0.100648568,10.3206563 0.0462914401,10.1764412 0.0434656621,10.0251232 C0.049203635,10.1714661 0.102998953,10.3100937 0.19429151,10.4137931 L0.482034193,10.7389163 Z"
                      id="Path"
                      fill="#000000"
                    ></path>
                    <path
                      d="M0.482034193,9.26699507 L0.195160823,9.59162562 C0.103422018,9.69547386 0.0493061615,9.83447977 0.0434656621,9.98128079 C0.0458127837,9.82989728 0.0998802455,9.68544731 0.19429151,9.57832512 L0.409446537,9.33448276 C0.431630223,9.30934242 0.455943299,9.28673757 0.482034193,9.26699507 L0.482034193,9.26699507 Z"
                      id="Path"
                      fill="#000000"
                    ></path>
                  </g>
                </g>
              </g>
            </g>
          </g>
        </svg>
      </button>
      <button
        className={"next-section-button" + (hasNextSection() ? "" : " hidden")}
        disabled={!hasNextSection()}
        aria-label="next section"
        onClick={() => changeSection(NEXT_SECTION)}
      >
        <svg width="150px" height="50px" viewBox="0 0 150 50">
          <title>next section</title>
          <g
            id="Screens"
            stroke="none"
            strokeWidth="1"
            fill="none"
            fillRule="evenodd"
          >
            <g
              id="Survey/1.Background-Information---Complete"
              transform="translate(-913.000000, -788.000000)"
            >
              <g id="Group-8" transform="translate(913.000000, 788.000000)">
                <rect
                  id="Rectangle"
                  fill="#F6A85C"
                  x="0"
                  y="0"
                  width="150"
                  height="50"
                ></rect>
                <text
                  id="Next-Section"
                  fill="#404040"
                  fillRule="nonzero"
                  fontFamily="SpecialElite-Regular, Special Elite"
                  fontSize="14"
                  fontWeight="normal"
                >
                  <tspan x="29" y="42">
                    Next Section
                  </tspan>
                </text>
                <g
                  id="chevron"
                  transform="translate(76.000000, 14.000000) scale(-1, 1) translate(-76.000000, -14.000000) translate(71.000000, 4.000000)"
                  fillRule="nonzero"
                >
                  <path
                    d="M9.41596639,18.7044335 C9.51417506,18.8153509 9.56937683,18.9660188 9.56937683,19.1231527 C9.56937683,19.2802866 9.51417506,19.4309546 9.41596639,19.5418719 L9.20081136,19.7857143 C9.1029431,19.8970174 8.97000077,19.9595794 8.83135323,19.9595794 C8.69270569,19.9595794 8.55976336,19.8970174 8.4618951,19.7857143 L0.482034193,10.7389163 L0.195160823,10.4133005 C0.103648089,10.3098784 0.0495436573,10.1714289 0.0434656621,10.0251232 C0.0421611556,10.0105464 0.0421611556,9.99585752 0.0434656621,9.98128079 C0.0490730077,9.83461507 0.102871693,9.69562738 0.19429151,9.59162562 L0.48116488,9.26699507 L8.46319907,0.221674877 C8.56106733,0.110371713 8.69400966,0.047809713 8.8326572,0.047809713 C8.97130474,0.047809713 9.10424707,0.110371713 9.20211533,0.221674877 L9.41727036,0.465517241 C9.51547903,0.576434604 9.5706808,0.727102575 9.5706808,0.884236453 C9.5706808,1.04137033 9.51547903,1.1920383 9.41727036,1.30295567 L1.73862649,10.0029557 L9.41596639,18.7044335 Z"
                    id="Path"
                    fill="#404040"
                  ></path>
                  <path
                    d="M0.482034193,10.7389163 C0.456651008,10.7185164 0.432675561,10.6959553 0.41031585,10.6714286 L0.195160823,10.4275862 C0.100648568,10.3206563 0.0462914401,10.1764412 0.0434656621,10.0251232 C0.049203635,10.1714661 0.102998953,10.3100937 0.19429151,10.4137931 L0.482034193,10.7389163 Z"
                    id="Path"
                    fill="#000000"
                  ></path>
                  <path
                    d="M0.482034193,9.26699507 L0.195160823,9.59162562 C0.103422018,9.69547386 0.0493061615,9.83447977 0.0434656621,9.98128079 C0.0458127837,9.82989728 0.0998802455,9.68544731 0.19429151,9.57832512 L0.409446537,9.33448276 C0.431630223,9.30934242 0.455943299,9.28673757 0.482034193,9.26699507 L0.482034193,9.26699507 Z"
                    id="Path"
                    fill="#000000"
                  ></path>
                </g>
              </g>
            </g>
          </g>
        </svg>
      </button>
    </div>
  );
}

export default SectionBottomNavigation;
