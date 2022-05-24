import {buildUser} from '../support/generate'

describe('smoke', () => {
  it('should allow a typical user flow', () => {
    const user = buildUser()

    cy.visit('/') // (📜 https://docs.cypress.io/api/commands/visit.html)

    cy.findByRole('button', {name: /register/i}).click()

    // within to simulate a user's behavior
    cy.findByRole('dialog').within(() => {
      cy.findByRole('textbox', {name: 'Username'}).type(user.username)
      cy.findByLabelText(/Password/i).type(user.password) // password type input doesn't have a role for security reasons
      cy.findByRole('button', {name: /Register/}).click()
    })
    // 📜 https://docs.cypress.io/api/commands/within.html#Syntax
    // 📜 https://docs.cypress.io/api/commands/type.html#Syntax

    cy.findByRole('navigation').within(() => {
      cy.findByRole('link', {name: /discover/i}).click()
    })

    cy.findByRole('main').within(() => {
      cy.findByRole('searchbox', {name: /search/i}).type('Voice{enter}') // you can make it hit the enter key with "{enter}"
      cy.findByLabelText(/Add to list/i).click()
    })

    cy.findByRole('navigation').within(() => {
      cy.findByRole('link', {name: /reading list/i}).click()
    })

    cy.findByRole('main').within(() => {
      cy.findAllByRole('listitem').should('have.length', 1) // https://docs.cypress.io/api/commands/should.html (.should('have.length', 1))
      cy.findByRole('link', {name: /Voice/i}).click()
    })

    cy.findByRole('textbox', {name: /notes/i}).type('text')
    cy.findByLabelText(/loading/i).should('exist')
    cy.findByLabelText(/loading/i).should('not.exist')

    cy.findByRole('button', {name: /mark as read/i}).click()
    cy.findByRole('radio', {name: /5 stars/i}).click({force: true}) // 📜 https://docs.cypress.io/api/commands/click.html#Arguments
    // the radio buttons are fancy and the inputs themselves are visually hidden
    // in favor of nice looking stars, so we have to the force option to click, so cypress will click on it event if it's not visible

    cy.findByRole('navigation').within(() => {
      cy.findByRole('link', {name: /finished books/i}).click()
    })

    cy.findByRole('main').within(() => {
      cy.findAllByRole('listitem').should('have.length', 1)
      cy.findByRole('radio', {name: /5 stars/i}).should('be.checked')
    })

    cy.findByRole('main').within(() => {
      cy.findByRole('link', {name: /Voice/i}).click()
      cy.findByRole('button', {name: /remove from list/i}).click()
      cy.findByRole('radio', {name: /5 stars/i}).should('not.exist')
      cy.findByRole('textbox', {name: /notes/i}).should('not.exist')
    })

    cy.findByRole('navigation').within(() => {
      cy.findByRole('link', {name: /finished books/i}).click()
    })

    cy.findByRole('main').within(() => {
      cy.findAllByRole('listitem').should('not.exist')
    })
  })
})
