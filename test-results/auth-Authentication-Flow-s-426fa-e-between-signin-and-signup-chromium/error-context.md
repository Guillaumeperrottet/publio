# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e6]:
    - link "Publio La plateforme d'appels d'offres équitables" [ref=e8] [cursor=pointer]:
      - /url: /
      - heading "Publio" [level=1] [ref=e9]
      - paragraph [ref=e10]: La plateforme d'appels d'offres équitables
    - generic [ref=e11]:
      - generic [ref=e12]:
        - heading "Connexion" [level=3] [ref=e13]:
          - generic [ref=e15]:
            - text: Connexion
            - img
        - paragraph [ref=e16]: Connectez-vous à votre compte Publio
      - generic [ref=e17]:
        - generic [ref=e18]:
          - generic [ref=e19]:
            - generic [ref=e20]: Email
            - textbox "Email" [ref=e21]:
              - /placeholder: vous@exemple.ch
          - generic [ref=e22]:
            - generic [ref=e23]: Mot de passe
            - textbox "Mot de passe" [ref=e24]:
              - /placeholder: ••••••••
          - button "Se connecter" [ref=e25]
        - generic [ref=e26]:
          - text: Pas encore de compte ?
          - link "Créer un compte" [ref=e27] [cursor=pointer]:
            - /url: /auth/signup
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e33] [cursor=pointer]:
    - img [ref=e34]
  - alert [ref=e37]
```