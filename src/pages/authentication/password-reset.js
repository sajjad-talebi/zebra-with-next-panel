import { useEffect } from 'react';
import Head from 'next/head';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { Box, Card, Container, Divider, Link, Typography ,TextField,Button} from '@mui/material';
import { useFormik } from 'formik';
import { backEndConfig } from '../../config';
import { GuestGuard } from '../../components/authentication/guest-guard';
import { AuthBanner } from '../../components/authentication/auth-banner';
import { AmplifyPasswordReset } from '../../components/authentication/amplify-password-reset';
import * as Yup from 'yup';
import { Logo } from '../../components/logo';
import { useAuth } from '../../hooks/use-auth';
import { gtm } from '../../lib/gtm';
import axios from 'axios';

const platformIcons = {
  Amplify: '/static/icons/amplify.svg',
  Auth0: '/static/icons/auth0.svg',
  Firebase: '/static/icons/firebase.svg',
  JWT: '/static/icons/jwt.svg'
};

const PasswordReset = () => {
  const router = useRouter();
  const { platform } = useAuth();
  const { disableGuard } = router.query;
  const formik = useFormik({
    initialValues: {
      email: '',
      submit: null
    },
    validationSchema: Yup.object({
      email: Yup
        .string()
        .email('Must be a valid email')
        .max(255)
        .required('Email is required'),
    }),
    onSubmit: async (values, helpers) => {

      await axios.post(backEndConfig.back_end_address+'forgot-password', {
        email: values.email
      }).then((res) => {
        alert(res.data.message)
      }
      ).catch((err) => {
        alert(err.response.data.message)
      } );
    }
  });

  useEffect(() => {
    gtm.push({ event: 'page_view' });
  }, []);

  return (
    <>
      <Head>
        <title>
          Password Reset | Material Kit Pro
        </title>
      </Head>
      <Box
        component="main"
        sx={{
          backgroundColor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh'
        }}
      >
        <AuthBanner />
        <Container
          maxWidth="sm"
          sx={{
            py: {
              xs: '60px',
              md: '120px'
            }
          }}
        >
          <Box
            sx={{
              alignItems: 'center',
              backgroundColor: (theme) => theme.palette.mode === 'dark'
                ? 'neutral.900'
                : 'neutral.100',
              borderColor: 'divider',
              borderRadius: 1,
              borderStyle: 'solid',
              borderWidth: 1,
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              mb: 4,
              p: 2,
              '& > img': {
                height: 32,
                width: 'auto',
                flexGrow: 0,
                flexShrink: 0
              }
            }}
          >
            <Typography
              color="textSecondary"
              variant="caption"
            >
              The app authenticates via {platform}
            </Typography>
            <img
              alt="Auth platform"
              src={platformIcons[platform]}
            />
          </Box>
          <Card
            elevation={16}
            sx={{ p: 4 }}
          >
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <NextLink
                href="/"
                passHref
              >
                <a>
                  <Logo
                    sx={{
                      height: 40,
                      width: 40
                    }}
                  />
                </a>
              </NextLink>
              <Typography variant="h4">
                Password Reset
              </Typography>
              <Typography
                color="textSecondary"
                sx={{ mt: 2 }}
                variant="body2"
              >
                Reset your account password using your code
              </Typography>
            </Box>
            <form
              noValidate
              onSubmit={formik.handleSubmit}>
                    <Box
                      sx={{
                        flexGrow: 1,
                        mt: 3
                      }}
                    >
                          <TextField
                error={Boolean(formik.touched.email && formik.errors.email)}
                fullWidth
                helperText={formik.touched.email && formik.errors.email}
                label="Email Address"
                margin="normal"
                name="email"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                type="email"
                value={formik.values.email}
              />
                    </Box>
                    <Box sx={{ mt: 2 }}>
                <Button
                  disabled={formik.isSubmitting}
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                >
                  Register
                </Button>
              </Box>
        </form>
            <Divider sx={{ my: 3 }} />
            {platform === 'Amplify' && (
              <div>
                <NextLink
                  href={disableGuard
                    ? `/authentication/password-recovery?disableGuard=${disableGuard}`
                    : '/authentication/password-recovery'}
                  passHref
                >
                  <Link
                    color="textSecondary"
                    variant="body2"
                  >
                    Did you not receive the code?
                  </Link>
                </NextLink>
              </div>
            )}
          </Card>
        </Container>
      </Box>
    </>
  );
};

PasswordReset.getLayout = (page) => (
  <GuestGuard>
    {page}
  </GuestGuard>
);

export default PasswordReset;
