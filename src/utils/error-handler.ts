import {Request, Response, NextFunction} from 'express';

const errorHandler = function(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log('internal server error: ');
  console.log(err);
  res.status(err.status || 500).send({error: err});
};
export default errorHandler;
