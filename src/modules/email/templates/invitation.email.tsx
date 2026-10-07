import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text
  } from 'react-email'
  
  interface InvitationEmailProps {
    firstName: string
    invitationUrl: string
  }
  
  export function InvitationEmail({
    firstName,
    invitationUrl
  }: InvitationEmailProps) {
    return (
      <Html lang="es">
        <Head />
  
        <Preview>
          Has sido invitado a la plataforma TELETEC
        </Preview>
  
        <Body style={body}>
          <Container style={container}>
            <Heading style={heading}>
              Bienvenido a TELETEC
            </Heading>
  
            <Text style={text}>
              Hola {firstName},
            </Text>
  
            <Text style={text}>
              Has sido invitado a formar parte de la plataforma
              de Administración de Obras de TELETEC.
            </Text>
  
            <Text style={text}>
              Para activar tu cuenta y establecer tu contraseña,
              utiliza el siguiente botón.
            </Text>
  
            <Section style={buttonContainer}>
              <Button
                href={invitationUrl}
                style={button}
              >
                Aceptar invitación
              </Button>
            </Section>
  
            <Text style={secondaryText}>
              Esta invitación tiene una vigencia limitada.
              Si no esperabas este correo, puedes ignorarlo.
            </Text>
          </Container>
        </Body>
      </Html>
    )
  }
  
  const body = {
    backgroundColor: '#f5f7fa',
    fontFamily: 'Arial, sans-serif',
    margin: 0,
    padding: '32px 0'
  }
  
  const container = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    margin: '0 auto',
    maxWidth: '560px',
    padding: '40px'
  }
  
  const heading = {
    color: '#111827',
    fontSize: '26px',
    marginBottom: '24px'
  }
  
  const text = {
    color: '#344054',
    fontSize: '16px',
    lineHeight: '24px'
  }
  
  const secondaryText = {
    color: '#667085',
    fontSize: '13px',
    lineHeight: '20px',
    marginTop: '32px'
  }
  
  const buttonContainer = {
    margin: '32px 0'
  }
  
  const button = {
    backgroundColor: '#fed302',
    borderRadius: '8px',
    color: '#111827',
    display: 'inline-block',
    fontSize: '15px',
    fontWeight: 'bold',
    padding: '14px 24px',
    textDecoration: 'none'
  }