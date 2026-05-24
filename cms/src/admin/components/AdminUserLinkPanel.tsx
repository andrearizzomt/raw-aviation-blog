import { useEffect, useState } from 'react';
import { useFetchClient, useForm } from '@strapi/admin/strapi-admin';
import {
  Box,
  Field,
  Flex,
  SingleSelect,
  SingleSelectOption,
  Typography,
} from '@strapi/design-system';

const AUTHOR_PROFILE_UID = 'api::author-profile.author-profile';

type LinkableAdminUser = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  label: string;
};

type AdminUserLinkPanelProps = {
  model: string;
  documentId?: string;
};

function formatUserName(user: Pick<LinkableAdminUser, 'firstname' | 'lastname'>) {
  return `${user.firstname} ${user.lastname}`.trim();
}

export const AdminUserLinkPanel = ({ model, documentId }: AdminUserLinkPanelProps) => {
  const { get } = useFetchClient();
  const onChange = useForm('AdminUserLinkPanel', (state) => state.onChange);
  const adminUserId = useForm('AdminUserLinkPanel', (state) => state.values.adminUserId);
  const firstName = useForm('AdminUserLinkPanel', (state) => state.values.firstName);
  const lastName = useForm('AdminUserLinkPanel', (state) => state.values.lastName);
  const email = useForm('AdminUserLinkPanel', (state) => state.values.email);

  const [users, setUsers] = useState<LinkableAdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (model !== AUTHOR_PROFILE_UID) {
      return;
    }

    let cancelled = false;

    const loadUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const query = documentId ? `?excludeDocumentId=${encodeURIComponent(documentId)}` : '';
        const { data } = await get<{ data: LinkableAdminUser[] }>(
          `/admin/author-profiles/linkable-admin-users${query}`
        );

        if (!cancelled) {
          setUsers(data.data ?? []);
        }
      } catch {
        if (!cancelled) {
          setError('Could not load admin users.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadUsers();

    return () => {
      cancelled = true;
    };
  }, [documentId, get, model]);

  if (model !== AUTHOR_PROFILE_UID) {
    return null;
  }

  const selectedValue = adminUserId != null ? String(adminUserId) : undefined;
  const selectedUser =
    users.find((user) => user.id === adminUserId) ??
    (adminUserId && firstName && lastName && email
      ? {
          id: adminUserId,
          firstname: firstName,
          lastname: lastName,
          email,
          label: formatUserName({ firstname: firstName, lastname: lastName }),
        }
      : null);

  const handleSelect = (value: string | number) => {
    const user = users.find((entry) => String(entry.id) === String(value));

    if (!user) {
      return;
    }

    onChange('adminUserId', user.id);
    onChange('firstName', user.firstname);
    onChange('lastName', user.lastname);
    onChange('email', user.email);
  };

  return {
    title: 'CMS Admin User',
    content: (
      <Box paddingTop={2} paddingBottom={2} width="100%" maxWidth="100%">
        <Field.Root width="100%">
          <Field.Label>Link to admin user</Field.Label>
          <Flex direction="column" alignItems="stretch" gap={2} width="100%" maxWidth="100%">
            <Box width="100%" maxWidth="100%" overflow="hidden">
              <SingleSelect
                placeholder={loading ? 'Loading admin users…' : 'Select an admin user'}
                value={selectedValue}
                onChange={handleSelect}
                disabled={loading || Boolean(error)}
                width="100%"
              >
                {selectedUser && !users.some((user) => user.id === selectedUser.id) ? (
                  <SingleSelectOption value={String(selectedUser.id)}>
                    {formatUserName(selectedUser)}
                  </SingleSelectOption>
                ) : null}
                {users.map((user) => (
                  <SingleSelectOption key={user.id} value={String(user.id)}>
                    {formatUserName(user)}
                  </SingleSelectOption>
                ))}
              </SingleSelect>
            </Box>
            {selectedUser?.email ? (
              <Typography variant="pi" textColor="neutral600" ellipsis>
                {selectedUser.email}
              </Typography>
            ) : null}
          </Flex>
          <Field.Hint>
            Links this profile to a user from Settings → Administration Panel.
          </Field.Hint>
          {error ? (
            <Typography variant="pi" textColor="danger600">
              {error}
            </Typography>
          ) : null}
        </Field.Root>
      </Box>
    ),
  };
};
