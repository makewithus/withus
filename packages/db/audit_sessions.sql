SELECT 
  permission,
  scope,
  status,
  COUNT(*) as count
FROM "DelegatedSession"
GROUP BY permission, scope, status
ORDER BY permission, scope, status;
