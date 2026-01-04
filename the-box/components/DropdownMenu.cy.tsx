import CustomDropdown from "./DropdownMenu";

describe("<CustomDropdown />", () => {
  const mockOptions = [
    { label: "Today", value: "today" },
    { label: "This Week", value: "week" },
    { label: "This Month", value: "month" },
    { label: "This Year", value: "year" },
  ];

  it("renders with required props", () => {
    const onValueChange = cy.stub();

    cy.mount(
      <CustomDropdown
        options={mockOptions}
        selectedValue="today"
        onValueChange={onValueChange}
        placeholder="Select time period"
      />
    );

    cy.getByTestId("dropdown-container").should("be.visible");
  });

  it("displays selected value", () => {
    const onValueChange = cy.stub();

    cy.mount(
      <CustomDropdown
        options={mockOptions}
        selectedValue="week"
        onValueChange={onValueChange}
      />
    );

    cy.contains("This Week").should("be.visible");
  });

  it("toggles dropdown when clicked", () => {
    const onValueChange = cy.stub();

    cy.mount(
      <CustomDropdown
        options={mockOptions}
        selectedValue="today"
        onValueChange={onValueChange}
      />
    );

    cy.getByTestId("dropdown-toggle").click();
    cy.getByTestId("dropdown-option-week").should("be.visible");
  });

  it("calls onValueChange when option is selected", () => {
    const onValueChange = cy.stub();

    cy.mount(
      <CustomDropdown
        options={mockOptions}
        selectedValue="today"
        onValueChange={onValueChange}
      />
    );

    cy.getByTestId("dropdown-toggle").click();
    cy.getByTestId("dropdown-option-month").click();
    cy.wrap(onValueChange).should("have.been.calledWith", "month");
  });
});
