This is the Flask 3.1.0 feature release. A feature release may include new features, remove previously deprecated code, add new deprecations, or introduce potentially breaking changes. We encourage everyone to upgrade, and to use a tool such as pip-tools to pin all dependencies and control upgrades. Test with warnings treated as errors to be able to adapt to deprecation warnings early.

PyPI: https://pypi.org/project/Flask/3.1.0/
Changes: https://flask.palletsprojects.com/en/stable/changes/#version-3-1-0
Milestone: https://github.com/pallets/flask/milestone/33?closed=1

Drop support for Python 3.8. #5623
Update minimum dependency versions to latest feature releases. Werkzeug >= 3.1, ItsDangerous >= 2.2, Blinker >= 1.9. #5624, #5633
Provide a configuration option to control automatic option responses. #5496
Flask.open_resource/open_instance_resource and Blueprint.open_resource take an encoding parameter to use when opening in text mode. It defaults to utf-8. #5504
Request.max_content_length can be customized per-request instead of only through the MAX_CONTENT_LENGTH config. Added MAX_FORM_MEMORY_SIZE and MAX_FORM_PARTS config. Added documentation about resource limits to the security page. #5625
Add support for the Partitioned cookie attribute (CHIPS), with the SESSION_COOKIE_PARTITIONED config. #5472
-e path takes precedence over default .env and .flaskenv files. load_dotenv loads default files in addition to a path unless load_defaults=False is passed. #5628
Support key rotation with the SECRET_KEY_FALLBACKS config, a list of old secret keys that can still be used for unsigning. Extensions will need to add support. #5621
Fix how setting host_matching=True or subdomain_matching=False interacts with SERVER_NAME. Setting SERVER_NAME no longer restricts requests to only that domain. #5553
Request.trusted_hosts is checked during routing, and can be set through the TRUSTED_HOSTS config. #5636