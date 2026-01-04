import React from 'react'
import Splash from './Splash'

describe('Splash component tests', () => {
  it('renders the splash screen container', () => {
    cy.mount(<Splash />)
    cy.getByTestId('splash-container').should('be.visible')
  })

  it('displays the app logo', () => {
    cy.mount(<Splash />)
    cy.getByTestId('splash-logo').should('be.visible')
  })

  it('displays the tagline text', () => {
    cy.mount(<Splash />)
    cy.getByTestId('splash-tagline').should('be.visible')
    cy.getByTestId('splash-tagline').should('contain', 'Just say it.')
    cy.getByTestId('splash-tagline').should('contain', 'Anonymously.')
  })

  it('displays the loading indicator', () => {
    cy.mount(<Splash />)
    cy.getByTestId('splash-loading').should('be.visible')
  })

  it('renders animated content', () => {
    cy.mount(<Splash />)
    cy.getByTestId('splash-animated-content').should('exist')
  })
})
