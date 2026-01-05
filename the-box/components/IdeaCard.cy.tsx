import React from "react";
import { Idea } from "@/types/index";
import IdeaCard from "./IdeaCard";

describe("IdeaCard component tests", () => {
  const mockIdea: Idea = {
    id: "idea-1",
    company_id: "company-123",
    subject: "Improve Break Room",
    description:
      "We should add a coffee machine and comfortable seating in the break room.",
    status: "to_be_reviewed",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
    created_by: "user-1",
    department: "HR",
  };

  const mockIdeaWithoutSubject: Idea = {
    ...mockIdea,
    id: "idea-2",
    subject: undefined,
    description: "A simple idea without a subject line.",
  };

  it("should render the component with all elements", () => {
    cy.mount(<IdeaCard idea={mockIdea} initialIsFollowing={false} />);

    cy.getByTestId("idea-card-idea-1").should("exist");
    cy.getByTestId("idea-card-content").should("be.visible");
    cy.getByTestId("idea-card-date").should("be.visible");
    cy.getByTestId("idea-card-subject")
      .should("be.visible")
      .and("contain", "Improve Break Room");
    cy.getByTestId("idea-card-description")
      .should("be.visible")
      .and("contain", "coffee machine");
    cy.getByTestId("idea-card-status")
      .should("be.visible")
      .and("contain", "To_be_reviewed");
    cy.getByTestId("idea-card-comment-button").should("be.visible");
    cy.getByTestId("idea-card-follow-button").should("be.visible");
  });

  it("should render without subject when subject is not provided", () => {
    cy.mount(
      <IdeaCard idea={mockIdeaWithoutSubject} initialIsFollowing={false} />
    );

    cy.getByTestId("idea-card-subject").should("not.exist");
    cy.getByTestId("idea-card-description")
      .should("be.visible")
      .and("contain", "A simple idea");
  });

  it("should display relative time correctly", () => {
    cy.mount(<IdeaCard idea={mockIdea} initialIsFollowing={false} />);
    cy.getByTestId("idea-card-date").should("contain", "h ago");
  });

  it('should format recent time as "Now"', () => {
    const recentIdea = {
      ...mockIdea,
      created_at: new Date().toISOString(),
    };

    cy.mount(<IdeaCard idea={recentIdea} initialIsFollowing={false} />);
    cy.getByTestId("idea-card-date").should("contain", "Now");
  });

  it("should call onComment when comment button is clicked", () => {
    const onCommentStub = cy.stub().as("onComment");

    cy.mount(
      <IdeaCard
        idea={mockIdea}
        initialIsFollowing={false}
        onComment={onCommentStub}
      />
    );

    cy.getByTestId("idea-card-comment-button").click();
    cy.get("@onComment").should("have.been.calledOnce");
  });

  it("should call onFollow with correct state when follow button is clicked", () => {
    const onFollowStub = cy.stub().resolves();

    cy.mount(
      <IdeaCard
        idea={mockIdea}
        initialIsFollowing={false}
        onFollow={onFollowStub}
      />
    );

    cy.getByTestId("idea-card-follow-button").click();
    cy.wrap(onFollowStub).should("have.been.calledOnceWith", false);
  });

  it("should call onFollow when unfollowing", () => {
    const onFollowStub = cy.stub().resolves();

    cy.mount(
      <IdeaCard
        idea={mockIdea}
        initialIsFollowing={true}
        onFollow={onFollowStub}
      />
    );

    cy.getByTestId("idea-card-follow-button").click();
    cy.wrap(onFollowStub).should("have.been.calledOnceWith", true);
  });

  it("should display different time formats correctly", () => {
    const testCases = [
      { time: new Date(Date.now() - 30 * 1000), expected: "Now" }, // 30 seconds ago
      { time: new Date(Date.now() - 5 * 60 * 1000), expected: "5m ago" }, // 5 minutes
      { time: new Date(Date.now() - 90 * 60 * 1000), expected: "1h ago" }, // 1.5 hours
      {
        time: new Date(Date.now() - 24 * 60 * 60 * 1000),
        expected: "1 day ago",
      }, // 1 day
      {
        time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        expected: "5 days ago",
      }, // 5 days
    ];

    testCases.forEach(({ time, expected }) => {
      cy.mount(
        <IdeaCard
          idea={{ ...mockIdea, created_at: time.toISOString() }}
          initialIsFollowing={false}
        />
      );
      cy.getByTestId("idea-card-date").should("contain", expected);
    });
  });
});
